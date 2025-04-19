import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { SCALE_FACTOR } from '../common';
import { ElementSystem } from '../objects/element-system';

export class TitleScene extends Phaser.Scene {
  private bgOverlay!: Phaser.GameObjects.Image;
  private elementSystem!: ElementSystem;
  private lockInput!: boolean;
  private buttonContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }

  public create(): void {
    this.lockInput = false;
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'title', 0).setScale(SCALE_FACTOR);
    const titleText = this.add.image(this.scale.width / 2 + 20, 180, 'title_text', 0).setScale(0.7);
    const fx = (titleText.preFX as Phaser.GameObjects.Components.FX).addReveal(0.1, 0, 0);
    this.bgOverlay = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'bg_overlay', 0)
      .setScale(SCALE_FACTOR);
    this.createButtons();

    this.elementSystem = new ElementSystem([], this, this.bgOverlay);

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      this.tweens.add({
        targets: fx,
        progress: 1,
        repeat: 0,
        duration: 2000,
        delay: 500,
        onComplete: () => {
          void this.elementSystem.exampleEffects();
          this.scene.launch(SCENE_KEYS.UI_SCENE);
          this.tweens.add({
            targets: this.buttonContainer,
            alpha: 1,
            repeat: 0,
            duration: 500,
          });
        },
      });
    });
  }

  public update(time: number, delta: number): void {
    this.elementSystem.update(time, delta);
  }

  public createButtons(): void {
    const button1 = this.add.image(this.scale.width / 2, 380, 'button', 0).setScale(SCALE_FACTOR);
    const button1Text = this.add.image(this.scale.width / 2, 380, 'play_btn_txt', 0).setScale(1);
    Phaser.Display.Align.In.Center(button1Text, button1);

    const button2 = this.add.image(this.scale.width / 2, 450, 'button', 0).setScale(SCALE_FACTOR);
    const button2Text = this.add.image(this.scale.width / 2, 450, 'credits_btn_txt', 0).setScale(1);
    Phaser.Display.Align.In.Center(button2Text, button2);

    this.buttonContainer = this.add.container(0, 0, [button1, button1Text, button2, button2Text]).setAlpha(0);

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
          this.scene.start(SCENE_KEYS.GAME_SCENE);
        });
        button1.disableInteractive();
        button2.disableInteractive();
      });

    button2
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        button2Text.setAlpha(0.7);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        button2Text.setAlpha(1);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (this.lockInput) {
          return;
        }
        this.lockInput = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(SCENE_KEYS.GAME_SCENE);
        });
        button1.disableInteractive();
        button2.disableInteractive();
      });
  }
}
