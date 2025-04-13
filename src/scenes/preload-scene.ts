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
    this.load.spritesheet('items', 'assets/spritesheets/items.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  public create(): void {
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }
}
