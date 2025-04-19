const frag = `
#define SHADER_NAME RAIN_SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform float uLightning;
uniform vec2 resolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uMix;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  vec2 uv = outTexCoord;

  // Base scene color
  vec4 baseColor = texture2D(uMainSampler, uv);
  vec4 stormColor = baseColor;

  // Storm darkening
  stormColor.rgb *= 0.6;

  // Lightning flash (scaled by uMix)
  stormColor.rgb += uLightning * vec3(1.0);
  stormColor.rgb = clamp(stormColor.rgb, 0.0, 1.0);

  // Shift UV to make diagonal rain
  uv.x += uv.y * 0.5;

  // Rain drops
  float dropFrequency = 200.0;
  float speed = 0.6;
  float rain = step(0.95, rand(vec2(floor(uv.x * dropFrequency), floor((uv.y + time * speed) * dropFrequency))));
  vec4 rainColor = vec4(0.6, 0.6, 0.8, rain * 1.0); // white-blue rain tint

  // Blend rain into storm scene (only where rain alpha is 1)
  stormColor = mix(stormColor, rainColor, rainColor.a);

  // Mix final result with base scene based on uMix
  gl_FragColor = mix(baseColor, stormColor, uMix);
}
`;

export class RainPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private customTime: number;
  private intensity: number;
  public uMix: number;

  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: frag,
    });
    this.customTime = 0;
    this.intensity = 0;
    this.uMix = 0.0;
  }

  set currentTime(val: number) {
    this.customTime = val;
  }

  set lightningIntensity(val: number) {
    this.intensity = val;
  }

  onPreRender() {
    this.set1f('time', this.customTime);
    this.set1f('uLightning', this.intensity);
    this.set1f('uMix', this.uMix);
  }
}
