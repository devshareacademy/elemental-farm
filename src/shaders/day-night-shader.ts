const frag = `
#define SHADER_NAME DAY_NIGHT_SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

uniform float uTimeOfDay; // 0.0 = midnight, 0.5 = noon, 1.0 = next midnight

void main(void) {
  vec2 uv = outTexCoord;
  vec4 color = texture2D(uMainSampler, uv);

  // Convert uTimeOfDay to hour (0.0–1.0) → (0–24 hours)
  float hour = uTimeOfDay * 24.0;

  // Daytime range (6 AM to 8 PM)
  float dayStart = 6.0;
  float dayEnd = 20.0;

  // Smooth fade in/out near day start/end
  float fadeRange = 2.0; // 2-hour fade in/out

  // Fade-in from 4 AM to 6 AM
  float fadeIn = smoothstep(dayStart - fadeRange, dayStart, hour);
  // Fade-out from 8 PM to 10 PM
  float fadeOut = 1.0 - smoothstep(dayEnd, dayEnd + fadeRange, hour);

  // Combined brightness factor
  float brightness = clamp(min(fadeIn, fadeOut), 0.0, 1.0);

  // Day/night tints
  vec3 nightTint = vec3(0.3, 0.35, 0.45);
  vec3 dayTint = vec3(1.0, 1.0, 1.0);

  vec3 finalTint = mix(nightTint, dayTint, brightness);

  // Apply tint and brightness
  color.rgb *= finalTint * mix(0.8, 1.1, brightness);

  gl_FragColor = color;
}
`;

export class DayNightPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private customTime: number;
  public uTimeOfDay: number;

  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: frag,
    });
    this.customTime = 0;
    this.uTimeOfDay = 0.5;
  }

  set currentTime(val: number) {
    this.customTime = val;
  }

  onPreRender() {
    this.set1f('time', this.customTime);
    this.set1f('uTimeOfDay', this.uTimeOfDay);
  }
}
