import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import {
  FARM_TILE_BALANCE_TYPE,
  FarmTileBalanceType,
  GridPosition,
  INTRO_DIALOG,
  PLANT_TYPE,
  PlantType,
} from '../common';
import { SCALE_FACTOR, TILE_SIZE } from '../common';
import { ElementSystem } from '../objects/element-system';
import { FarmTile } from '../objects/farm-tile';
import { ElementPieGauge } from '../objects/element-pie-gauge';
import { DAY_DURATION, getTimeOfDay } from '../common/utils';
import { DayNightPipeline } from '../shaders/day-night-shader';
import { UiScene } from './ui-scene';
import { harvestCrop, plantCrop } from '../common/goals';

const DATA_KEYS = {
  GRID: 'GRID',
  SEED_TYPE: 'SEED_TYPE',
} as const;

const STARTING_TILES = [
  [1, 1, 1, 1],
  [1, 1, 0, 0],
  [1, 0, 0, 2],
  [0, 0, 2, 2],
] as const;

export class GameScene extends Phaser.Scene {
  private selectedSeedPacket: undefined | Phaser.GameObjects.Image;
  private toolCursor!: Phaser.GameObjects.Image;
  private selectedPlot!: Phaser.GameObjects.Rectangle;
  private farmTiles!: FarmTile[][];
  private lockInput!: boolean;
  private elementSystem!: ElementSystem;
  private pie!: ElementPieGauge;
  private bgOverlay!: Phaser.GameObjects.Image;
  private clock!: number;
  private tutorialFinished!: boolean;
  private dialogIndex!: number;
  private introDialogElementObjects!: Phaser.GameObjects.Text[];
  private introDialogElementsTween!: Phaser.Tweens.Tween | undefined;
  private introDialogFieldRect!: Phaser.GameObjects.Rectangle | undefined;
  private introDialogFieldRectTween!: Phaser.Tweens.Tween | undefined;
  private introDialogElementOverflowRect!: Phaser.GameObjects.Rectangle | undefined;
  private introDialogElementOverflowTween!: Phaser.Tweens.Tween | undefined;
  private currentDay!: number;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  public create(): void {
    this.lockInput = true;
    this.clock = DAY_DURATION / 2;
    this.tutorialFinished = false;
    this.dialogIndex = 0;
    this.currentDay = 1;

    this.createBackgroundAndGui();
    this.createSeedPackets();
    this.selectedPlot = this.add
      .rectangle(TILE_SIZE * 5 + 1, TILE_SIZE + TILE_SIZE / 2 + 14, TILE_SIZE - 4, TILE_SIZE - 4, 0xffffff, 0.8)
      .setVisible(false);
    this.createFarmTiles();
    this.toolCursor = this.add
      .image(0, 0, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setVisible(false)
      .setAngle(-45)
      .setOrigin(0.05, 0.2)
      .setDepth(2);
    this.elementSystem = new ElementSystem(this.farmTiles, this, this.bgOverlay);
    this.pie = new ElementPieGauge(this, 125, 125, 100, this.elementSystem.balance);
    this.cameras.main.setPostPipeline(DayNightPipeline);
    if (!this.scene.isActive(SCENE_KEYS.UI_SCENE)) {
      this.scene.launch(SCENE_KEYS.UI_SCENE);
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).dialog.skipCallback = () => {
        this.finishedIntro();
      };
      void this.showIntroDialog();
    });
  }

  private async showIntroDialog(): Promise<void> {
    await (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).dialog.showDialog(INTRO_DIALOG[this.dialogIndex]);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, async () => {
      if (this.tutorialFinished) {
        return;
      }
      this.dialogIndex += 1;
      if (this.dialogIndex >= INTRO_DIALOG.length) {
        this.finishedIntro();
        return;
      }

      if (this.dialogIndex === 1) {
        this.showIntroElementsText();
      } else if (this.dialogIndex === 2) {
        this.cleanupIntroElementsText();
        this.showIntroFieldObjects();
      } else if (this.dialogIndex === 3) {
        this.cleanupIntroFieldObjects();
        this.showIntroDialogObjects();
      } else if (this.dialogIndex === 4) {
        this.cleanupIntroDialogObjects();
        this.showIntroFieldObjects();
      } else if (this.dialogIndex === 6) {
        this.cleanupIntroFieldObjects();
      } else if (this.dialogIndex === 7) {
        (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).toggleQuests();
      } else if (this.dialogIndex === 8) {
        (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).toggleQuests();
      }

      await this.showIntroDialog();
    });
  }

  public finishedIntro(): void {
    this.lockInput = false;
    this.tutorialFinished = true;
    (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).dialog.hide();
    (this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).tutorialFinished = true;
    this.cleanupIntroElementsText();
    this.cleanupIntroFieldObjects();
    this.cleanupIntroDialogObjects();

    const uiScene = this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene;
    uiScene.showTimeDetails();
    uiScene.questIcon.setVisible(true);
    this.elementSystem.checkElementalBalances();
  }

  private showIntroElementsText(): void {
    const fireText = this.add.text(150, 180, 'FIRE', {
      fontFamily: 'pixellari',
      fontSize: '40px',
      color: '#000',
    });
    const airText = this.add.text(60, 30, 'AIR', {
      fontFamily: 'pixellari',
      fontSize: '40px',
      color: '#000',
    });
    const waterText = this.add.text(150, 30, 'WATER', {
      fontFamily: 'pixellari',
      fontSize: '40px',
      color: '#000',
    });
    const earthText = this.add.text(5, 120, 'EARTH', {
      fontFamily: 'pixellari',
      fontSize: '40px',
      color: '#000',
    });
    this.introDialogElementObjects = [fireText, airText, waterText, earthText];
    this.introDialogElementsTween = this.tweens.add({
      targets: this.introDialogElementObjects,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      repeat: -1,
      yoyo: true,
    });
  }

  private cleanupIntroElementsText(): void {
    this.introDialogElementsTween?.destroy();
    this.introDialogElementsTween = undefined;
    this.introDialogElementObjects?.forEach((obj) => obj.destroy());
    this.introDialogElementObjects = [];
  }

  private showIntroFieldObjects(): void {
    this.introDialogFieldRect = this.add
      .rectangle(TILE_SIZE * 7.5, TILE_SIZE * 3.75, TILE_SIZE * 4.5, TILE_SIZE * 3.5, 0xff0000, 0.0)
      .setStrokeStyle(2, 0x000000, 1)
      .setOrigin(0.5);
    this.introDialogFieldRectTween = this.tweens.add({
      targets: this.introDialogFieldRect,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
  }

  private cleanupIntroFieldObjects(): void {
    this.introDialogFieldRectTween?.destroy();
    this.introDialogFieldRectTween = undefined;
    this.introDialogFieldRect?.destroy();
    this.introDialogFieldRect = undefined;
  }

  private showIntroDialogObjects(): void {
    this.introDialogElementOverflowRect = this.add
      .rectangle(150, 160, 210, 120, 0x000000, 0)
      .setStrokeStyle(2, 0x000000, 1)
      .setOrigin(0.5)
      .setAngle(148);
    this.introDialogElementOverflowTween = this.tweens.add({
      targets: this.introDialogElementOverflowRect,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
  }

  private cleanupIntroDialogObjects(): void {
    this.introDialogElementOverflowTween?.destroy();
    this.introDialogElementOverflowTween = undefined;
    this.introDialogElementOverflowRect?.destroy();
    this.introDialogElementOverflowRect = undefined;
  }

  private createBackgroundAndGui(): void {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg', 0).setScale(SCALE_FACTOR);
    this.bgOverlay = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'bg_overlay', 0)
      .setScale(SCALE_FACTOR);
    this.add.image(this.scale.width / 2, this.scale.height - 5, 'panel', 0).setScale(SCALE_FACTOR);
  }

  public update(time: number, delta: number): void {
    this.elementSystem.update(time, delta);

    if (!this.tutorialFinished) {
      return;
    }

    this.clock += delta;
    const { dayCount, hours, minutes, progress } = getTimeOfDay(this.clock);
    const pipeline = this.cameras.main.getPostPipeline(DayNightPipeline) as DayNightPipeline;
    pipeline.uTimeOfDay = progress;
    const uiScene = this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene;
    uiScene.setClockText(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    uiScene.setDayText(dayCount.toString(10));

    if (dayCount > this.currentDay) {
      this.currentDay += 1;
      uiScene.showInfoText(`Day ${this.currentDay}`);
      uiScene.refreshQuests();
    }

    if (this.selectedSeedPacket === undefined) {
      return;
    }
    const pointer = this.input.activePointer;
    this.toolCursor.setPosition(pointer.worldX, pointer.worldY);
  }

  private handleToolSelected(gameObject: Phaser.GameObjects.Image): void {
    if (!this.tutorialFinished || this.lockInput) {
      return;
    }

    const isAlreadySelected = this.selectedSeedPacket === gameObject;
    if (this.selectedSeedPacket !== undefined) {
      this.selectedSeedPacket.postFX.disable(true);
      if (isAlreadySelected) {
        this.selectedSeedPacket = undefined;
        this.toolCursor.setVisible(false);
        this.selectedPlot.setVisible(false);
        this.unHighlighFarmTiles();
        return;
      }
    }

    this.selectedSeedPacket = gameObject;
    gameObject.postFX.enable();
    gameObject.postFX.addGlow(0xffffff, 4, 0, false, 0.1, 10);

    this.toolCursor.setVisible(true).setFrame(this.selectedSeedPacket.frame);
    this.highlighFarmTiles();
  }

  private highlighFarmTiles(): void {
    if (this.selectedSeedPacket === undefined) {
      return;
    }
    const plantType = this.selectedSeedPacket.getData(DATA_KEYS.SEED_TYPE) as PlantType;
    this.farmTiles.forEach((tileRow) => {
      tileRow.forEach((tile) => {
        if (this.elementSystem.canPlantCrap(plantType, tile) && tile.isEmpty()) {
          tile.highLight();
        } else {
          tile.deHighLight();
        }
      });
    });
  }

  private unHighlighFarmTiles(): void {
    this.farmTiles.forEach((tileRow) => {
      tileRow.forEach((tile) => {
        tile.deHighLight();
      });
    });
  }

  private plantSeeds(gridPosition: GridPosition): void {
    if (this.selectedSeedPacket === undefined) {
      return;
    }
    if (!this.farmTiles[gridPosition.x][gridPosition.y].isEmpty()) {
      return;
    }
    const plantType = this.selectedSeedPacket.getData(DATA_KEYS.SEED_TYPE) as PlantType;

    // make sure we have enough element energy to plant this seed
    if (!this.elementSystem.canPlantCrap(plantType, this.farmTiles[gridPosition.x][gridPosition.y])) {
      // TODO: add some type of UI indicator
      return;
    }

    this.lockInput = true;
    this.tweens.add({
      targets: this.toolCursor,
      angle: -80,
      duration: 140,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        this.seedPlanted(gridPosition.x, gridPosition.y, plantType);
        this.lockInput = false;
      },
    });
  }

  private harvestPlant(gridPosition: GridPosition): void {
    const farmTile = this.farmTiles[gridPosition.x][gridPosition.y];
    if (farmTile.isEmpty() || !farmTile.isReadyToHarvest()) {
      return;
    }
    const cropType = farmTile.harvestCrop() as PlantType;
    this.elementSystem.harvestCrop(cropType);
    this.checkBalance();
    harvestCrop(cropType);
    const uiScene = this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene;
    uiScene.checkGoals();
  }

  private createFarmTiles(): void {
    this.farmTiles = [];

    for (let i = 0; i < 4; i += 1) {
      this.farmTiles.push([]);
      for (let j = 1; j < 4; j += 1) {
        const gridPosition: GridPosition = {
          x: i,
          y: j - 1,
        };
        const x = TILE_SIZE * (5 + i) + 1 + TILE_SIZE;
        const y = TILE_SIZE * j + TILE_SIZE / 2 + 14 + TILE_SIZE;
        const balanceType = STARTING_TILES[gridPosition.y][gridPosition.x];
        let farmBalanceType: FarmTileBalanceType = FARM_TILE_BALANCE_TYPE.BALANCED;
        if (balanceType === 1) {
          farmBalanceType = FARM_TILE_BALANCE_TYPE.FIRE;
        } else if (balanceType === 2) {
          farmBalanceType = FARM_TILE_BALANCE_TYPE.WATER;
        }
        const farmTile = new FarmTile(this, x, y, gridPosition, farmBalanceType);
        farmTile
          .on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this.selectedSeedPacket === undefined) {
              return;
            }
            this.selectedPlot.setVisible(true).setPosition(x, y);
          })
          .on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.lockInput) {
              return;
            }
            if (this.selectedSeedPacket === undefined) {
              this.harvestPlant(gridPosition);
              return;
            }
            this.plantSeeds(gridPosition);
          });
        this.farmTiles[i].push(farmTile);
      }
    }
  }

  private createSeedPackets(): void {
    const seedPacket1 = this.add
      .image(TILE_SIZE * 6, this.scale.height - TILE_SIZE / 2, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.PUMPKIN)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket1));
    const seedPacket2 = this.add
      .image(TILE_SIZE * 7, this.scale.height - TILE_SIZE / 2, 'items', 6)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.POTATO)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket2));
    const seedPacket3 = this.add
      .image(TILE_SIZE * 8, this.scale.height - TILE_SIZE / 2, 'items', 7)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.CARROT)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket3));
    const seedPacket4 = this.add
      .image(TILE_SIZE * 9, this.scale.height - TILE_SIZE / 2, 'items', 8)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.TOMATO)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket4));
  }

  private seedPlanted(x: number, y: number, plantType: PlantType): void {
    this.farmTiles[x][y].plantCrop(plantType);
    this.elementSystem.plantCrop(plantType);
    this.checkBalance();
    plantCrop(plantType);
    const uiScene = this.scene.get(SCENE_KEYS.UI_SCENE) as UiScene;
    uiScene.checkGoals();
  }

  private checkBalance(): void {
    this.pie.setBalance(this.elementSystem.balance);
  }
}
