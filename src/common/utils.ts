export const DAY_DURATION = 60000 * 1; // 5 minutes in ms
// 60000 - 1 minute in ms
// 1200_000 - 20 min

export function getTimeOfDay(clockMs: number) {
  const progress = (clockMs % DAY_DURATION) / DAY_DURATION;
  const dayCount = Math.floor(clockMs / DAY_DURATION) + 1; // total days passed
  const hours = Math.floor(progress * 24);
  const minutes = Math.floor((progress * 24 - hours) * 60);
  return { dayCount, hours, minutes, progress }; // use progress for shader
}

export function animateText(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  text: string,
  config?: {
    callback?: () => void;
    delay?: number;
  },
): void {
  const length = text.length;
  let i = 0;
  scene.time.addEvent({
    callback: () => {
      target.text += text[i];
      ++i;
      if (i === length - 1 && config?.callback) {
        config.callback();
      }
    },
    repeat: length - 1,
    delay: config?.delay || 25,
  });
}
