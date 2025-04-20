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
  vec4 sceneColor = texture2D(uMainSampler, uv);

  // Darken for storm
  sceneColor.rgb *= 0.9;

  // Add lightning flash
  sceneColor.rgb += uLightning * vec3(1.0);
  sceneColor.rgb = clamp(sceneColor.rgb, 0.0, 1.0);

  // Adjust to make rain fall diagonally
  uv.x += uv.y * 0.5;

  // Create the rain pattern
  float dropFrequency = 200.0;
  float speed = 0.6;
  float rain = step(0.95, rand(vec2(floor(uv.x * dropFrequency), floor((uv.y + time * speed) * dropFrequency))));
  vec4 rainColor = vec4(0.6, 0.6, 0.8, rain * 1.0); // adjust alpha for intensity

  gl_FragColor = mix(sceneColor, rainColor, rainColor.a);
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
