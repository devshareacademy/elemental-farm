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
  private balance: ElementBalance;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, balance: ElementBalance) {
    super(scene, x, y);

    this.radius = radius;
    this.balance = balance;
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.draw();
    scene.add.existing(this);
  }

  public setBalance(balance: ElementBalance): void {
    this.balance = balance;
    this.draw();
  }

  private draw() {
    this.graphics.clear();

    const total = Object.values(this.balance).reduce((sum, v) => sum + v, 0);
    if (total === 0) return;

    let startAngle = -Math.PI / 2;

    for (const element of Object.values(ELEMENTS)) {
      const value = this.balance[element];
      const proportion = value / total;
      const endAngle = startAngle + proportion * Math.PI * 2;

      this.graphics.fillStyle(ELEMENT_COLORS[element], 1);
      this.graphics.slice(0, 0, this.radius, startAngle, endAngle, false);
      this.graphics.fillPath();

      startAngle = endAngle;
    }
  }
}
