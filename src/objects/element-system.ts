import {
  ElementBalance,
  ELEMENTS,
  ElementType,
  PLANT_TYPE_TO_ELEMENT_MAP,
  PlantType,
  SCALE_FACTOR,
  TILE_SIZE,
} from '../common';
import { eventResolved } from '../common/goals';
import { SCENE_KEYS } from '../scenes/scene-keys';
import { UiScene } from '../scenes/ui-scene';
import { AirShaderPipeline } from '../shaders/air-shader';
import { DayNightPipeline } from '../shaders/day-night-shader';
import { HeatwavePipeline } from '../shaders/heat-wave-shader';
import { RainPipeline } from '../shaders/rain-shader';
import { FarmTile } from './farm-tile';

export class ElementSystem {
  private scene: Phaser.Scene;
  private elementBalance: ElementBalance;
  private elementBalanceTotal: number;
  private lightningIntensity: number;
  private lastLightningTime: number;
  private isStorming: boolean;
  private isHeatWave: boolean;
  private isWindy: boolean;
  private isOvergrown: boolean;
  private overGrownPlants: Phaser.GameObjects.Group;
  private leaves: Phaser.GameObjects.Sprite[];
  private plantsOverlay: Phaser.GameObjects.Image;
  private weatherQueue: { start: boolean; element: ElementType; clear?: boolean }[];
  private isTransitioning: boolean;

  constructor(farmTiles: FarmTile[][], scene: Phaser.Scene, plants: Phaser.GameObjects.Image) {
    this.weatherQueue = [];
    this.isTransitioning = false;
    this.elementBalance = {
      [ELEMENTS.AIR]: 0,
      [ELEMENTS.EARTH]: 0,
      [ELEMENTS.FIRE]: 0,
      [ELEMENTS.WATER]: 0,
    };
    farmTiles.forEach((farmTileRow) => {
      farmTileRow.forEach((farmTile) => {
        this.elementBalance.AIR += farmTile.soilBalance.AIR;
        this.elementBalance.EARTH += farmTile.soilBalance.EARTH;
        this.elementBalance.FIRE += farmTile.soilBalance.FIRE;
        this.elementBalance.WATER += farmTile.soilBalance.WATER;
      });
    });
    this.elementBalanceTotal = Object.values(this.elementBalance).reduce((sum, value) => sum + value, 0);
    this.lastLightningTime = 0;
    this.lightningIntensity = 0;
    this.isStorming = false;
    this.isHeatWave = false;
    this.isWindy = false;
    this.isOvergrown = false;
    this.scene = scene;
    this.plantsOverlay = plants;

    this.overGrownPlants = this.scene.add.group([
      this.scene.add.image(TILE_SIZE * 2, TILE_SIZE * 8, 'grass', 1).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 4, TILE_SIZE * 6, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 14, TILE_SIZE * 0.5, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 5.5, TILE_SIZE * 2, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 11, TILE_SIZE * 3, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 9, TILE_SIZE * 1, 'grass', 1).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 4, TILE_SIZE * 1, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 0, TILE_SIZE * 4, 'grass', 0).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 14, TILE_SIZE * 7, 'grass', 1).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 10, TILE_SIZE * 6.5, 'grass', 1).setScale(SCALE_FACTOR / 2),
      this.scene.add.image(TILE_SIZE * 7.5, TILE_SIZE * 4, 'grass', 0).setScale(SCALE_FACTOR / 2),
    ]);
    this.overGrownPlants.setVisible(false);

    this.leaves = [
      this.scene.add
        .sprite(100 * SCALE_FACTOR, 200 * SCALE_FACTOR, 'leaves', 0)
        .setScale(SCALE_FACTOR, SCALE_FACTOR)
        .setOrigin(0)
        .setDepth(3)
        .play('leaves')
        .setAngle(-135),
      this.scene.add
        .sprite(800, 200 * SCALE_FACTOR, 'leaves', 0)
        .setScale(SCALE_FACTOR, SCALE_FACTOR)
        .setOrigin(0)
        .setDepth(3)
        .play('leaves')
        .setAngle(-135),
    ];
    this.leaves.forEach((child) => child.setActive(false).setVisible(false));

    // add the pipeline to our renderer
    (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
      'HeatwavePipeline',
      HeatwavePipeline,
    );
    (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
      'RainPipeline',
      RainPipeline,
    );
    (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
      'AirShaderPipeline',
      AirShaderPipeline,
    );
    (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
      'DayNightPipeline',
      DayNightPipeline,
    );
  }

  public async exampleEffects(): Promise<void> {
    await this.sleep(500);
    await this.startFireElement();
    await this.sleep(4000);
    await this.clearCameraShader();

    await this.sleep(500);
    await this.startWaterElement();
    await this.sleep(4000);
    await this.clearCameraShader();

    await this.sleep(500);
    await this.startWindElement();
    await this.sleep(4000);
    await this.clearCameraShader();

    await this.sleep(500);
    this.startEarthElement();
    await this.sleep(4000);
    await this.clearCameraShader();

    await this.exampleEffects();
  }

  get balance(): ElementBalance {
    return this.elementBalance;
  }

  public canPlantCrap(plantType: PlantType, farmTile: FarmTile): boolean {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    if (
      this.elementBalance.AIR - elementImpact.consumes.AIR < 0 ||
      farmTile.soilBalance.AIR - elementImpact.consumes.AIR < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.EARTH - elementImpact.consumes.EARTH < 0 ||
      farmTile.soilBalance.EARTH - elementImpact.consumes.EARTH < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.FIRE - elementImpact.consumes.FIRE < 0 ||
      farmTile.soilBalance.FIRE - elementImpact.consumes.FIRE < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.WATER - elementImpact.consumes.WATER < 0 ||
      farmTile.soilBalance.WATER - elementImpact.consumes.WATER < 0
    ) {
      return false;
    }
    return true;
  }

  public plantCrop(plantType: PlantType): void {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    this.elementBalance.AIR -= elementImpact.consumes.AIR;
    this.elementBalance.WATER -= elementImpact.consumes.WATER;
    this.elementBalance.EARTH -= elementImpact.consumes.EARTH;
    this.elementBalance.FIRE -= elementImpact.consumes.FIRE;
    this.checkElementalBalances();
  }

  public harvestCrop(plantType: PlantType): void {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    this.elementBalance.AIR += elementImpact.returns.AIR;
    this.elementBalance.WATER += elementImpact.returns.WATER;
    this.elementBalance.EARTH += elementImpact.returns.EARTH;
    this.elementBalance.FIRE += elementImpact.returns.FIRE;
    this.checkElementalBalances();
  }

  public checkElementalBalances(): void {
    const topTwoEntries = Object.entries(this.elementBalance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    if (topTwoEntries[0][1] >= this.elementBalanceTotal / 4 + 15) {
      this.handleImbalance(topTwoEntries[0][0] as ElementType);
    } else {
      void this.clearCameraShader();
    }
  }

  public handleImbalance(elementType: ElementType): void {
    if (elementType === ELEMENTS.AIR) {
      if (!this.isWindy) {
        console.log('⚠️ Elemental imbalance detected! - wind');
        this.weatherQueue.push({ start: false, clear: true, element: ELEMENTS.AIR });
        this.weatherQueue.push({ start: true, clear: false, element: ELEMENTS.AIR });
      }
      return;
    }

    if (elementType === ELEMENTS.WATER) {
      if (!this.isStorming) {
        console.log('⚠️ Elemental imbalance detected! - water');
        this.weatherQueue.push({ start: false, clear: true, element: ELEMENTS.WATER });
        this.weatherQueue.push({ start: true, clear: false, element: ELEMENTS.WATER });
      }
      return;
    }

    if (elementType === ELEMENTS.FIRE) {
      if (!this.isHeatWave) {
        console.log('⚠️ Elemental imbalance detected! - heat');
        this.weatherQueue.push({ start: false, clear: true, element: ELEMENTS.FIRE });
        this.weatherQueue.push({ start: true, clear: false, element: ELEMENTS.FIRE });
      }
      return;
    }

    if (elementType === ELEMENTS.EARTH) {
      if (!this.isOvergrown) {
        console.log('⚠️ Elemental imbalance detected! - earth');
        this.weatherQueue.push({ start: false, clear: true, element: ELEMENTS.EARTH });
        this.weatherQueue.push({ start: true, clear: false, element: ELEMENTS.EARTH });
      }
      return;
    }
  }

  public update(time: number, delta: number): void {
    if (!this.isTransitioning && this.weatherQueue.length > 0) {
      const obj = this.weatherQueue.shift() as { start: boolean; element: ElementType; clear?: boolean };
      if (obj.clear) {
        void this.clearCameraShader();
      } else {
        if (obj.start) {
          if (obj.element === ELEMENTS.AIR) {
            void this.startWindElement();
          } else if (obj.element === ELEMENTS.EARTH) {
            void this.startEarthElement();
          } else if (obj.element === ELEMENTS.FIRE) {
            void this.startFireElement();
          } else if (obj.element === ELEMENTS.WATER) {
            void this.startWaterElement();
          }
        } else {
          if (obj.element === ELEMENTS.AIR) {
            void this.stopWindElement();
          } else if (obj.element === ELEMENTS.EARTH) {
            void this.stopEarthElement();
          } else if (obj.element === ELEMENTS.FIRE) {
            void this.stopFireElement();
          } else if (obj.element === ELEMENTS.WATER) {
            void this.stopWaterElement();
          }
        }
      }
    }

    if (this.isStorming) {
      // Random chance for lightning every few seconds
      if (time - this.lastLightningTime > 5000 && Math.random() > 0.97) {
        this.lightningIntensity = 0.8;
        this.lastLightningTime = time;

        // Trigger game-side effects
        this.scene.cameras.main.shake(500, 0.005);
        // TODO: play sound effect for thunder
      }

      // Decay the flash
      this.lightningIntensity = Math.max(0, this.lightningIntensity - delta * 0.004);

      // Pass to shader
      const pipeline = this.scene.cameras.main.getPostPipeline(RainPipeline) as RainPipeline;
      pipeline.currentTime = time / 1000;
      pipeline.lightningIntensity = this.lightningIntensity;
      return;
    }

    if (this.isHeatWave) {
      const pipeline = this.scene.cameras.main.getPostPipeline(HeatwavePipeline) as HeatwavePipeline;
      pipeline.currentTime = time / 1000;
      return;
    }

    if (this.isWindy) {
      const pipeline = this.plantsOverlay.getPostPipeline(AirShaderPipeline) as AirShaderPipeline;
      pipeline.currentTime = time / 1000;
      return;
    }
  }

  public startFireElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: true, element: ELEMENTS.FIRE });
        resolve();
        return;
      }

      this.isTransitioning = true;
      this.scene.cameras.main.resetPostPipeline();
      this.scene.cameras.main.setPostPipeline(HeatwavePipeline);
      const pipeline = this.scene.cameras.main.getPostPipeline(HeatwavePipeline) as HeatwavePipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
      this.isHeatWave = true;
    });
  }

  private stopFireElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: false, element: ELEMENTS.FIRE });
        resolve();
        return;
      }

      this.isTransitioning = true;
      const pipeline = this.scene.cameras.main.getPostPipeline(HeatwavePipeline) as HeatwavePipeline;
      // Tween to fade out the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 0.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isHeatWave = false;
          this.scene.cameras.main.removePostPipeline('HeatwavePipeline');
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
    });
  }

  private startWaterElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: true, element: ELEMENTS.WATER });
        resolve();
        return;
      }

      this.isTransitioning = true;
      this.scene.cameras.main.resetPostPipeline();
      this.scene.cameras.main.setPostPipeline(RainPipeline);
      const pipeline = this.scene.cameras.main.getPostPipeline(RainPipeline) as RainPipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
      this.isStorming = true;
    });
  }

  private stopWaterElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: false, element: ELEMENTS.WATER });
        resolve();
        return;
      }

      this.isTransitioning = true;
      const pipeline = this.scene.cameras.main.getPostPipeline(RainPipeline) as RainPipeline;
      // Tween to fade out the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 0.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isStorming = false;
          this.scene.cameras.main.removePostPipeline('RainPipeline');
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
    });
  }

  private async startWindElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: true, element: ELEMENTS.AIR });
        resolve();
        return;
      }

      this.isTransitioning = true;
      this.leaves.forEach((child) => child.setActive(true).setVisible(true).setAlpha(0));
      this.scene.tweens.add({
        targets: this.leaves,
        duration: 1000,
        delay: 100,
        repeat: 0,
        alpha: 1,
      });

      this.scene.cameras.main.resetPostPipeline();
      this.plantsOverlay.setPostPipeline(AirShaderPipeline);
      const pipeline = this.plantsOverlay.getPostPipeline(AirShaderPipeline) as AirShaderPipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1000, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
      this.isWindy = true;
    });
  }

  private async stopWindElement(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isTransitioning) {
        this.weatherQueue.push({ start: false, element: ELEMENTS.AIR });
        resolve();
        return;
      }

      this.isTransitioning = true;
      this.scene.tweens.add({
        targets: this.leaves,
        duration: 1000,
        delay: 100,
        repeat: 0,
        alpha: 0,
      });

      const pipeline = this.plantsOverlay.getPostPipeline(AirShaderPipeline) as AirShaderPipeline;
      // Tween to fade out the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 0.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          this.isWindy = false;
          this.leaves.forEach((child) => child.setActive(false).setVisible(false));
          this.plantsOverlay.removePostPipeline('AirShaderPipeline');
          this.isTransitioning = false;
          resolve(undefined);
        },
      });
    });
  }

  private startEarthElement(): void {
    if (this.isTransitioning) {
      this.weatherQueue.push({ start: true, element: ELEMENTS.EARTH });
      return;
    }

    this.isTransitioning = true;
    this.overGrownPlants.setAlpha(0).setVisible(true);
    this.overGrownPlants.getChildren().forEach((child) => (child as Phaser.GameObjects.Image).setScale(0.1));
    this.scene.tweens.add({
      targets: this.overGrownPlants.getChildren(),
      duration: 2000,
      delay: 100,
      repeat: 0,
      alpha: 1,
      scaleX: SCALE_FACTOR / 2,
      scaleY: SCALE_FACTOR / 2,
    });
    this.isOvergrown = true;
    this.isTransitioning = false;
  }

  private stopEarthElement(): void {
    if (this.isTransitioning) {
      this.weatherQueue.push({ start: false, element: ELEMENTS.EARTH });
      return;
    }

    this.isTransitioning = true;
    this.isOvergrown = false;
    this.scene.tweens.add({
      targets: this.overGrownPlants.getChildren(),
      duration: 1000,
      delay: 100,
      repeat: 0,
      alpha: 0,
      scaleX: SCALE_FACTOR / 2,
      scaleY: SCALE_FACTOR / 2,
      onComplete: () => {
        this.overGrownPlants.setAlpha(0).setVisible(false);
      },
    });
    this.isTransitioning = false;
  }

  private async clearCameraShader(): Promise<void> {
    const isTutorialFinished = (this.scene.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).tutorialFinished;
    if (this.isHeatWave) {
      await this.stopFireElement();
      if (isTutorialFinished) {
        eventResolved(ELEMENTS.FIRE);
      }
    } else if (this.isStorming) {
      await this.stopWaterElement();
      if (isTutorialFinished) {
        eventResolved(ELEMENTS.WATER);
      }
    } else if (this.isWindy) {
      await this.stopWindElement();
      if (isTutorialFinished) {
        eventResolved(ELEMENTS.AIR);
      }
    } else if (this.isOvergrown) {
      this.stopEarthElement();
      if (isTutorialFinished) {
        eventResolved(ELEMENTS.EARTH);
      }
    } else {
      return;
    }
    (this.scene.scene.get(SCENE_KEYS.UI_SCENE) as UiScene).checkGoals();
  }

  private async sleep(delay: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(delay, () => {
        resolve(undefined);
      });
    });
  }
}
