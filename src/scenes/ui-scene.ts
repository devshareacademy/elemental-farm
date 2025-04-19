import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { TILE_SIZE } from '../common';

export class UiScene extends Phaser.Scene {
  private soundButton!: Phaser.GameObjects.Image;
  private trackNumber!: number;
  private playlist!: (Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound)[];
  private dayText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE,
    });
  }

  public preload(): void {
    this.trackNumber = 4;
    this.playlist = [];
    this.soundButton = this.add
      .image(this.scale.width - TILE_SIZE * 1.25, 0, 'music_on', 0)
      .setScale(1.5)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.soundButton.setAlpha(0.8);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        this.soundButton.setAlpha(1.0);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.toggleAudio();
      });

    this.load.audio('bg_3', 'assets/audio/Ambient-4.mp3');
    this.load.audio('bg_1', 'assets/audio/Ambient-1.mp3');
    this.load.audio('bg_2', 'assets/audio/Ambient-2.mp3');

    this.sound.setVolume(0.3);
    this.sound.setRate(1);

    this.playlist.push(this.sound.add(`bg_${this.trackNumber}`));
    this.playlist[0].play();

    this.dayText = this.add
      .text(90, this.scale.height - 34, 'Day: 1', {
        fontFamily: 'pixellari',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setVisible(false);
    this.clockText = this.add
      .text(0, this.scale.height - 34, '12:00', {
        fontFamily: 'pixellari',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setVisible(false);
  }

  public create(): void {
    this.playlist.push(this.sound.add('bg_1'));
    this.playlist.push(this.sound.add('bg_2'));
    this.playlist.push(this.sound.add('bg_3'));

    this.playlist.forEach((sound, index) => {
      sound.on('complete', () => {
        if (index === this.playlist.length - 1) {
          this.playlist[0].play();
        } else {
          this.playlist[index + 1].play();
        }
      });
    });
  }

  public toggleAudio(): void {
    const isMuted = this.sound.mute;
    this.sound.setMute(!this.sound.mute);
    if (isMuted) {
      this.soundButton.setTexture('music_on');
    } else {
      this.soundButton.setTexture('music_off');
    }
  }

  public showTimeDetails(): void {
    this.dayText.setVisible(true);
    this.clockText.setVisible(true);
  }

  public setDayText(val: string): void {
    this.dayText.setText(`Day: ${val}`);
  }

  public setClockText(val: string): void {
    this.clockText.setText(val);
  }
}
