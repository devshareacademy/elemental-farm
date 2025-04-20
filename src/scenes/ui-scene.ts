import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { SCALE_FACTOR, TILE_SIZE } from '../common';
import { Dialog } from '../objects/dialog';
import { CURRENT_GOALS, markGoalAsFinished, refreshQuests } from '../common/goals';

const timeTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'pixellari',
  fontSize: '32px',
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 5,
};
const questTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'pixellari',
  fontSize: '22px',
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 5,
  wordWrap: {
    width: 225,
  },
};

export class UiScene extends Phaser.Scene {
  private soundButton!: Phaser.GameObjects.Image;
  private trackNumber!: number;
  private playlist!: (Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound)[];
  private dayText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  public dialog!: Dialog;
  private questContainer!: Phaser.GameObjects.Container;
  private questMarks!: Phaser.GameObjects.Image[];
  private questMarkBoxes!: Phaser.GameObjects.Rectangle[];
  private questTextObjs!: Phaser.GameObjects.Text[];
  public questIcon!: Phaser.GameObjects.Image;
  private infoText!: Phaser.GameObjects.Text;
  private infoTextFx1!: Phaser.FX.Wipe;
  private infoTextFx2!: Phaser.FX.Wipe;
  public tutorialFinished!: boolean;

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

    this.dayText = this.add.text(90, this.scale.height - 34, 'Day: 1', timeTextStyle).setVisible(false);
    this.clockText = this.add.text(0, this.scale.height - 34, '12:00', timeTextStyle).setVisible(false);

    this.questContainer = this.add
      .container(840, this.scale.height / 2, [
        this.add.image(0, 0, 'quest', 0).setScale(SCALE_FACTOR),
        this.add.text(0, -120, 'QUESTS', timeTextStyle).setOrigin(0.5),
      ])
      .setDepth(2);
    const questText1 = this.add.text(0, 0, CURRENT_GOALS[0].text, questTextStyle).setOrigin(0);
    const questText2 = this.add.text(0, 0, CURRENT_GOALS[1].text, questTextStyle).setOrigin(0);
    const questText3 = this.add.text(0, 0, CURRENT_GOALS[2].text, questTextStyle).setOrigin(0);
    this.questContainer.add([questText1, questText2, questText3]);
    this.questTextObjs = [questText1, questText2, questText3];

    const questBox1 = this.add.rectangle(0, 0, 15, 15, 0xffffff, 0).setStrokeStyle(2, 0x89503f, 1).setOrigin(0);
    const questBoxMark1 = this.add.image(0, 0, 'checkmark', 0).setOrigin(0).setScale(0.45).setVisible(false);
    const questBox2 = this.add.rectangle(0, 0, 15, 15, 0xffffff, 0).setStrokeStyle(2, 0x89503f, 1).setOrigin(0);
    const questBoxMark2 = this.add.image(0, 0, 'checkmark', 0).setOrigin(0).setScale(0.45).setVisible(false);
    const questBox3 = this.add.rectangle(0, 0, 15, 15, 0xffffff, 0).setStrokeStyle(2, 0x89503f, 1).setOrigin(0);
    const questBoxMark3 = this.add.image(0, 0, 'checkmark', 0).setOrigin(0).setScale(0.45).setVisible(false);
    this.questContainer.add([questBox1, questBoxMark1, questBox2, questBoxMark2, questBox3, questBoxMark3]);
    this.questMarks = [questBoxMark1, questBoxMark2, questBoxMark3];
    this.questMarkBoxes = [questBox1, questBox2, questBox3];

    this.positionQuestObjects();

    this.questContainer.setVisible(false);
    this.questIcon = this.add
      .image(this.scale.width - TILE_SIZE * 1.25, TILE_SIZE, 'exclamation', 0)
      .setScale(1.5)
      .setOrigin(0)
      .setVisible(false)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.questIcon.setAlpha(0.8);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        this.questIcon.setAlpha(1.0);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.toggleQuests();
      });

    this.infoText = this.add.text(this.scale.width / 2, 200, '', { ...timeTextStyle, fontSize: '52px' }).setOrigin(0.5);
    this.infoTextFx1 = (this.infoText.preFX as Phaser.GameObjects.Components.FX).addReveal(0.1, 0, 0);
    this.infoTextFx2 = (this.infoText.preFX as Phaser.GameObjects.Components.FX).addWipe(0.1, 0, 0);
    this.dialog = new Dialog({
      scene: this,
      x: 100,
      y: 400,
      skipCallback: () => {},
    });
    this.tutorialFinished = false;
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

  public toggleQuests(): void {
    this.questContainer.setVisible(!this.questContainer.visible);
  }

  public checkGoals(): void {
    if (!this.tutorialFinished) {
      return;
    }

    if (!CURRENT_GOALS[0].completed) {
      const isComplete = CURRENT_GOALS[0].check();
      if (isComplete) {
        this.questMarks[0].setVisible(true);
        markGoalAsFinished(0);
        this.showInfoText('Quest Completed!');
      }
    }
    if (!CURRENT_GOALS[1].completed) {
      const isComplete = CURRENT_GOALS[1].check();
      if (isComplete) {
        this.questMarks[1].setVisible(true);
        markGoalAsFinished(1);
        this.showInfoText('Quest Completed!');
      }
    }
    if (!CURRENT_GOALS[2].completed) {
      const isComplete = CURRENT_GOALS[2].check();
      if (isComplete) {
        this.questMarks[2].setVisible(true);
        markGoalAsFinished(2);
        this.showInfoText('Quest Completed!');
      }
    }
  }

  public showInfoText(text: string): void {
    this.infoText.setText(text);
    this.infoTextFx1.progress = 0;
    this.infoTextFx2.progress = 0;

    this.tweens.add({
      targets: this.infoTextFx1,
      progress: 1,
      repeat: 0,
      duration: 500,
      delay: 50,
      onComplete: () => {
        this.tweens.add({
          targets: this.infoTextFx2,
          progress: 1,
          repeat: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => {},
        });
      },
    });
  }

  public refreshQuests(): void {
    refreshQuests();
    this.questMarks.forEach((mark) => mark.setVisible(false));
    this.questTextObjs[0].setText(CURRENT_GOALS[0].text);
    this.questTextObjs[1].setText(CURRENT_GOALS[1].text);
    this.questTextObjs[2].setText(CURRENT_GOALS[2].text);

    this.positionQuestObjects();
  }

  private positionQuestObjects(): void {
    this.questTextObjs[0].setPosition(-100, -80);
    this.questTextObjs[1].setPosition(-100, this.questTextObjs[0].y + this.questTextObjs[0].displayHeight + 10);
    this.questTextObjs[2].setPosition(-100, this.questTextObjs[1].y + this.questTextObjs[1].displayHeight + 10);

    this.questMarkBoxes[0].setPosition(-125, -75);
    this.questMarks[0].setPosition(-128, -80);

    this.questMarkBoxes[1].setPosition(-125, this.questTextObjs[0].y + this.questTextObjs[0].displayHeight + 15);
    this.questMarks[1].setPosition(-128, this.questTextObjs[0].y + this.questTextObjs[0].displayHeight + 11);

    this.questMarkBoxes[2].setPosition(-125, this.questTextObjs[1].y + this.questTextObjs[1].displayHeight + 15);
    this.questMarks[2].setPosition(-128, this.questTextObjs[1].y + this.questTextObjs[1].displayHeight + 11);
  }
}
