import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';

const SCALE_FACTOR = 4;
const TILE_SIZE = 64;

export class GameScene extends Phaser.Scene {
  private selectedSeedPacket: undefined | Phaser.GameObjects.Image;
  private toolCursor!: Phaser.GameObjects.Image;
  private selectedPlot!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  public create(): void {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg', 0).setScale(SCALE_FACTOR);
    this.add.image(this.scale.width / 2, this.scale.height - 5, 'panel', 0).setScale(SCALE_FACTOR);

    const seedPacket1 = this.add
      .image(TILE_SIZE * 5, this.scale.height - TILE_SIZE / 2, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket1));
    const seedPacket2 = this.add
      .image(TILE_SIZE * 6, this.scale.height - TILE_SIZE / 2, 'items', 6)
      .setScale(SCALE_FACTOR)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket2));
    const seedPacket3 = this.add
      .image(TILE_SIZE * 7, this.scale.height - TILE_SIZE / 2, 'items', 7)
      .setScale(SCALE_FACTOR)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket3));

    this.selectedPlot = this.add
      .rectangle(TILE_SIZE * 5 + 1, TILE_SIZE + TILE_SIZE / 2 + 14, TILE_SIZE - 4, TILE_SIZE - 4, 0x9e5d3b, 0.8)
      .setVisible(false);
    for (let i = 0; i < 6; i += 1) {
      for (let j = 1; j < 6; j += 1) {
        const zone = this.add
          .zone(TILE_SIZE * (5 + i) + 1, TILE_SIZE * j + TILE_SIZE / 2 + 14, TILE_SIZE - 4, TILE_SIZE - 4)
          .setInteractive()
          .on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this.selectedSeedPacket === undefined) {
              return;
            }
            this.selectedPlot.setVisible(true).setPosition(zone.x, zone.y);
          });
      }
    }

    this.toolCursor = this.add
      .image(0, 0, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setVisible(false)
      .setAngle(-45)
      .setOrigin(0.05, 0.2);
  }

  public update(): void {
    if (this.selectedSeedPacket === undefined) {
      return;
    }
    const pointer = this.input.activePointer;
    this.toolCursor.setPosition(pointer.worldX, pointer.worldY);
  }

  private handleToolSelected(gameObject: Phaser.GameObjects.Image): void {
    const isAlreadySelected = this.selectedSeedPacket === gameObject;
    if (this.selectedSeedPacket !== undefined) {
      this.selectedSeedPacket.postFX.disable(true);
      if (isAlreadySelected) {
        this.selectedSeedPacket = undefined;
        this.toolCursor.setVisible(false);
        this.selectedPlot.setVisible(false);
        return;
      }
    }

    this.selectedSeedPacket = gameObject;
    gameObject.postFX.enable();
    gameObject.postFX.addGlow(0xffffff, 4, 0, false, 0.1, 10);

    this.toolCursor.setVisible(true).setFrame(this.selectedSeedPacket.frame);
  }
}
