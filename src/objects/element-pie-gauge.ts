import * as Phaser from 'phaser';
import { ElementBalance, ELEMENTS, ElementType } from '../common';

const ELEMENT_COLORS: Record<ElementType, number> = {
  EARTH: 0x4caf50, // green
  WATER: 0x2196f3, // blue
  FIRE: 0xf44336, // red
  AIR: 0xffeb3b, // yellow
};

export class ElementPieGauge extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private radius: number;
  private currentBalance: ElementBalance;
  private displayBalance: ElementBalance;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, initialBalance: ElementBalance) {
    super(scene, x, y);

    this.radius = radius;
    this.currentBalance = { ...initialBalance };
    this.displayBalance = { ...initialBalance };
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.draw();
    scene.add.existing(this);
  }

  public setBalance(newBalance: ElementBalance, duration = 500): void {
    this.currentBalance = { ...newBalance };

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const progress = tween.getValue();

        for (const key of Object.values(ELEMENTS)) {
          const from = this.displayBalance[key];
          const to = this.currentBalance[key];
          this.displayBalance[key] = Phaser.Math.Linear(from, to, progress);
        }

        this.draw();
      },
      onComplete: () => {
        this.displayBalance = { ...this.currentBalance };
        this.draw();
      },
    });
  }

  private draw(): void {
    this.graphics.clear();

    const total = Object.values(this.displayBalance).reduce((sum, v) => sum + v, 0);
    if (total === 0) return;

    let startAngle = -Math.PI / 2;

    for (const element of Object.values(ELEMENTS)) {
      const value = this.displayBalance[element];
      const proportion = value / total;
      const endAngle = startAngle + proportion * Math.PI * 2;

      const color = ELEMENT_COLORS[element];

      // --- Fill slice ---
      this.graphics.fillStyle(color, 1);
      this.graphics.beginPath();
      this.graphics.moveTo(0, 0);
      this.graphics.arc(0, 0, this.radius, startAngle, endAngle, false);
      this.graphics.closePath();
      this.graphics.fillPath();

      // --- Border stroke ---
      this.graphics.lineStyle(2, 0x000000, 1); // black border, 2px
      this.graphics.beginPath();
      this.graphics.moveTo(0, 0);
      this.graphics.arc(0, 0, this.radius, startAngle, endAngle, false);
      this.graphics.closePath();
      this.graphics.strokePath();

      startAngle = endAngle;
    }
  }
}
