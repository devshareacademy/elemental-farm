const frag = `
#define SHADER_NAME AIR_SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform float uMix;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
  vec2 uv = outTexCoord;

  float interval = 5.0;       // Time between gusts
  float gustDuration = 3.5;   // How long the gust lasts

  float cycle = fract(time / interval); // Current time in cycle
  float gustActive = step(cycle, gustDuration / interval); // Is gust active?

  // Gust movement progress (0 → 1) over the gust duration
  float gustProgress = cycle / (gustDuration / interval);
  gustProgress = clamp(gustProgress, 0.0, 1.0); // Just to be safe

  // Let the gust move from off-screen left to right
  float gustWidth = 0.3;
  float gustStart = -gustWidth + (1.0 + gustWidth * 2.0) * gustProgress; // from -0.3 to 1.3

  // Only apply distortion if inside the gust band
  float inGust = gustActive *
    smoothstep(gustStart, gustStart + gustWidth, uv.x) *
    (1.0 - smoothstep(gustStart + gustWidth, gustStart + gustWidth * 2.0, uv.x));

  // Distortion wave
  // float wave = sin((uv.x + time * 1.5) * 20.0) * 0.015 * inGust;
  float wave = sin((uv.x + time * 1.5) * 10.0) * 0.004 * inGust;
  uv.y += wave;

  vec4 color = texture2D(uMainSampler, uv);

  // Optional tint
  color.rgb += vec3(0.05, 0.05, 0.1) * inGust;

  gl_FragColor = color;
}
`;

export class AirShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private customTime: number;
  public uMix: number;

  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: frag,
    });
    this.customTime = 0;
    this.uMix = 0.0;
  }

  set currentTime(val: number) {
    this.customTime = val;
  }

  onPreRender() {
    this.set1f('time', this.customTime);
    this.set1f('uMix', this.uMix);
  }
}
