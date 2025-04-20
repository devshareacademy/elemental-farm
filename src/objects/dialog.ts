import { animateText } from '../common/utils';

type DialogConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  skipCallback: () => void;
};

export class Dialog {
  #scene: Phaser.Scene;
  #container: Phaser.GameObjects.Container;
  #dialogText: Phaser.GameObjects.Text;
  #arrow: Phaser.GameObjects.Image;
  #textAnimationPlaying: boolean;
  #skipCallback: () => void;

  constructor(config: DialogConfig) {
    this.#scene = config.scene;
    this.#skipCallback = config.skipCallback;
    this.#container = this.#scene.add.container(config.x, config.y, []).setDepth(3);
    this.#createUi();
    const profilePic = this.#scene.add.image(0, 35, 'portrait', 0).setScale(0.5).setOrigin(0, 0.2);
    this.#dialogText = this.#scene.add.text(140, 32, '', {
      fontFamily: 'pixellari',
      fontSize: '24px',
      wordWrap: {
        width: 600,
      },
      color: '#000',
    });
    this.#arrow = this.#scene.add.image(680, 100, 'arrow', 0).setScale(1.25).setOrigin(0).setVisible(false);
    this.#scene.tweens.add({
      targets: this.#arrow,
      x: this.#arrow.x + 8,
      yoyo: true,
      duration: 400,
      repeat: -1,
    });
    this.#container.add([profilePic, this.#dialogText, this.#arrow]);
    this.#container.setAlpha(1);
    this.#textAnimationPlaying = false;

    const skipText = this.#scene.add
      .text(370, 110, 'SKIP', {
        fontFamily: 'pixellari',
        fontSize: '24px',
        color: '#000',
      })
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        skipText.setAlpha(0.8);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        skipText.setAlpha(1);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.#skipCallback();
      });

    this.#container.add([skipText]);

    this.#container.setVisible(false);
  }

  set skipCallback(val: () => void) {
    this.#skipCallback = val;
  }

  get isAnimationPlaying(): boolean {
    return this.#textAnimationPlaying;
  }

  public setPosition(x: number, y: number): void {
    this.#container.setPosition(x, y);
  }

  public async showDialog(text: string): Promise<void> {
    this.#container.setVisible(true);
    return new Promise((resolve) => {
      this.#dialogText.setText('').setAlpha(1);
      this.#arrow.setVisible(false);
      animateText(this.#scene, this.#dialogText, text, {
        delay: 50,
        callback: () => {
          this.#textAnimationPlaying = false;
          this.#arrow.setVisible(true);
          resolve();
        },
      });
      this.#textAnimationPlaying = true;
    });
  }

  public hide(): void {
    this.#container.setAlpha(0);
  }

  #createUi(): void {
    const background = this.#scene.add.nineslice(0, 0, 'panel_beige', 0, 740, 140, 10, 10, 10, 10).setOrigin(0);
    this.#container.add([background]);
  }
}
