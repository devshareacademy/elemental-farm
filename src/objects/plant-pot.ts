import { SCALE_FACTOR } from '../common';
import { PLANT_TYPE, PlantType } from '../common/types';

const PLANT_TYPE_TO_SEED_MAP = {
  PUMPKIN: 0,
  POTATO: 10,
  CARROT: 5,
} as const;

export class PlantPlot extends Phaser.GameObjects.Image {
  private planted: boolean;
  private stage: number;
  private plantType: PlantType;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'plants', PLANT_TYPE_TO_SEED_MAP.PUMPKIN);
    scene.add.existing(this);
    this.setScale(SCALE_FACTOR).setVisible(false);
    this.planted = false;
    this.stage = 0;
    this.plantType = PLANT_TYPE.PUMPKIN;
  }

  get isPlanted(): boolean {
    return this.planted;
  }

  public plantSeed(plantType: PlantType): void {
    if (this.planted) {
      return;
    }
    const frame = PLANT_TYPE_TO_SEED_MAP[plantType];
    this.setFrame(frame).setVisible(true);
    this.planted = true;
    this.stage = 0;
    this.plantType = plantType;

    this.scene.time.addEvent({
      delay: 500,
      repeat: 3,
      callback: () => {
        this.stage += 1;
        this.setFrame(frame + this.stage);
      },
      callbackScope: this,
    });
  }
}
