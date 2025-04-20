import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { SCALE_FACTOR } from '../common';

const credits = `
Created By
Scott Westover - https://www.youtube.com/@swestover

Design
Scott Westover, Stone Fruit Studios

Art Assets
Butter Milk - https://butterymilk.itch.io/tiny-wonder-farm-asset-pack
RagnaPixel - https://ragnapixel.itch.io/particle-fx
Kenny - https://kenney.nl/assets/game-icons
Kenny - https://kenney.nl/assets/ui-pack-rpg-expansion
Zacchary Dempsey-Plante - https://www.dafont.com/zacchary-dempsey-plante.d6765

Audio
Alkakrab - https://alkakrab.itch.io/free-10-rpg-game-\nambient-tracks-music-pack-no-copyright
`;

export class CreditsScene extends Phaser.Scene {
  private lockInput!: boolean;
  private buttonContainer!: Phaser.GameObjects.Container;
  private creditsText!: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: SCENE_KEYS.CREDITS_SCENE,
    });
  }

  public create(): void {
    this.lockInput = false;
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'credits', 0).setScale(SCALE_FACTOR);
    this.createButtons();

    this.creditsText = this.add
      .text(this.scale.width / 4, 50, credits, {
        fontFamily: 'pixellari',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        wordWrap: {
          width: 500,
        },
      })
      .setOrigin(0);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  public createButtons(): void {
    const button1 = this.add.image(this.scale.width / 2, 480, 'button', 0).setScale(SCALE_FACTOR);
    const button1Text = this.add.image(this.scale.width / 2, 380, 'back_btn_text', 0).setScale(1);
    Phaser.Display.Align.In.Center(button1Text, button1);

    this.buttonContainer = this.add.container(0, 0, [button1, button1Text]);

    button1
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        button1Text.setAlpha(0.7);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        button1Text.setAlpha(1);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (this.lockInput) {
          return;
        }
        this.lockInput = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(SCENE_KEYS.TITLE_SCENE);
        });
        button1.disableInteractive();
      });
  }
}
