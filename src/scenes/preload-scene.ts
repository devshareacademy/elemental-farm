import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  public preload(): void {
    this.load.image('portrait', 'assets/images/portrait.png');
    this.load.image('panel_beige', 'assets/images/panel_beige.png');
    this.load.image('arrow', 'assets/images/arrowBrown_right.png');
    this.load.image('music_on', 'assets/images/musicOn.png');
    this.load.image('music_off', 'assets/images/musicOff.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('title_text', 'assets/images/title_text.png');
    this.load.image('button', 'assets/images/button.png');
    this.load.image('play_btn_txt', 'assets/images/play_btn_txt.png');
    this.load.image('credits_btn_txt', 'assets/images/credits_btn_txt.png');
    this.load.image('bg', 'assets/images/map.png');
    this.load.image('bg_overlay', 'assets/images/map_overlay.png');
    this.load.image('panel', 'assets/images/panel.png');
    this.load.spritesheet('grass', 'assets/spritesheets/grass.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('items', 'assets/spritesheets/items.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('plants', 'assets/spritesheets/plants.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('leaves', 'assets/spritesheets/leaves.png', {
      frameWidth: 150,
      frameHeight: 150,
    });
    this.load.audio('bg_4', 'assets/audio/Ambient-5.mp3');
    this.load.font('pixellari', 'assets/text/Pixellari.ttf', 'truetype');
  }

  public create(): void {
    this.createAnimations();
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'leaves',
      frames: this.anims.generateFrameNumbers('leaves'),
      frameRate: 8,
      repeat: -1,
      delay: 0,
      yoyo: false,
    });
  }
}
