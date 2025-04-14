import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  public preload(): void {
    // load asset pack that has assets for the rest of the game
    // this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');
    this.load.image('bg', 'assets/images/map.png');
    this.load.image('panel', 'assets/images/panel.png');
    this.load.spritesheet('items', 'assets/spritesheets/items.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('plants', 'assets/spritesheets/plants.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('gui', 'assets/spritesheets/element_bar.png', {
      frameWidth: 64,
      frameHeight: 540,
    });
  }

  public create(): void {
    this.createAnimations();
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'gui',
      frames: this.anims.generateFrameNumbers('gui'),
      frameRate: 2.5,
      repeat: -1,
      delay: 0,
      yoyo: false,
    });
  }
}
