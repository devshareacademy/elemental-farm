import {
  ElementBalance,
  ELEMENTS,
  ElementType,
  PLANT_TYPE_TO_ELEMENT_MAP,
  PlantType,
  SCALE_FACTOR,
  TILE_SIZE,
} from '../common';
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

  constructor(farmTiles: FarmTile[][], scene: Phaser.Scene, plants: Phaser.GameObjects.Image) {
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
    // console.log(topTwoEntries[0], topTwoEntries[1], this.elementBalanceTotal / 4);
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
        void this.startWindElement();
      }
      return;
    }

    if (elementType === ELEMENTS.WATER) {
      if (!this.isStorming) {
        console.log('⚠️ Elemental imbalance detected! - water');
        void this.startWaterElement();
      }
      return;
    }

    if (elementType === ELEMENTS.FIRE) {
      if (!this.isHeatWave) {
        console.log('⚠️ Elemental imbalance detected! - heat');
        void this.startFireElement();
      }
      return;
    }

    if (elementType === ELEMENTS.EARTH) {
      if (!this.isOvergrown) {
        console.log('⚠️ Elemental imbalance detected! - earth');
        void this.startEarthElement();
      }
      return;
    }
  }

  public update(time: number, delta: number): void {
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
      this.scene.cameras.main.setPostPipeline(HeatwavePipeline);
      const pipeline = this.scene.cameras.main.getPostPipeline(HeatwavePipeline) as HeatwavePipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          resolve(undefined);
        },
      });
      this.isHeatWave = true;
    });
  }

  private stopFireElement(): Promise<void> {
    return new Promise((resolve) => {
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
          resolve(undefined);
        },
      });
    });
  }

  private startWaterElement(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.cameras.main.setPostPipeline(RainPipeline);
      const pipeline = this.scene.cameras.main.getPostPipeline(RainPipeline) as RainPipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1500, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          resolve(undefined);
        },
      });
      this.isStorming = true;
    });
  }

  private stopWaterElement(): Promise<void> {
    return new Promise((resolve) => {
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
          resolve(undefined);
        },
      });
    });
  }

  private async startWindElement(): Promise<void> {
    return new Promise((resolve) => {
      this.leaves.forEach((child) => child.setActive(true).setVisible(true).setAlpha(0));
      this.scene.tweens.add({
        targets: this.leaves,
        duration: 1000,
        delay: 100,
        repeat: 0,
        alpha: 1,
      });

      this.plantsOverlay.setPostPipeline(AirShaderPipeline);
      const pipeline = this.plantsOverlay.getPostPipeline(AirShaderPipeline) as AirShaderPipeline;
      // Tween to fade in the effect
      this.scene.tweens.add({
        targets: pipeline,
        props: {
          uMix: { value: 1.0, duration: 1000, ease: 'Sine.easeInOut' },
        },
        onComplete: () => {
          resolve(undefined);
        },
      });
      this.isWindy = true;
    });
  }

  private async stopWindElement(): Promise<void> {
    return new Promise((resolve) => {
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
          resolve(undefined);
        },
      });
    });
  }

  private startEarthElement(): void {
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
  }

  private stopEarthElement(): void {
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
  }

  private async clearCameraShader(): Promise<void> {
    if (this.isHeatWave) {
      await this.stopFireElement();
      return;
    }
    if (this.isStorming) {
      await this.stopWaterElement();
      return;
    }
    if (this.isWindy) {
      await this.stopWindElement();
      return;
    }

    if (this.isOvergrown) {
      this.stopEarthElement();
    }
  }

  private async sleep(delay: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(delay, () => {
        resolve(undefined);
      });
    });
  }
}
