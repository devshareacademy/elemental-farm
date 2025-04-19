const frag = `
#define SHADER_NAME HEATWAVE_SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform float uMix;
uniform float time;
uniform vec2 resolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main(void) {
  vec2 uv = outTexCoord;

  // === HEAT WAVE DISTORTION ===
  float waveX = sin(uv.y * 10.0 + time * 0.9) * 0.005;
  float waveY = sin(uv.x * 20.0 + time * 1.2) * 0.002;
  uv.x += waveX * uMix;
  uv.y += waveY * uMix;

  vec4 baseColor = texture2D(uMainSampler, outTexCoord);
  vec4 distortedColor = texture2D(uMainSampler, uv);

  // === SUNNY COLOR TINT ===
  vec3 sunTint = vec3(1.0, 0.9, 0.6); // bright sunny color
  distortedColor.rgb = mix(distortedColor.rgb, sunTint, 0.1 * uMix);
  distortedColor.rgb *= 1.05; // slight brightness boost

  // === SUNLIGHT RAYS (from top center) ===
  vec2 sunPos = vec2(0.5, 1.2); // just above top center
  vec2 delta = uv - sunPos;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  float rays = sin(angle * 10.0 + time * 0.5) * 0.5 + 0.5; // wavy radial rays
  rays *= pow(1.0 - dist, 3.0); // fade out with distance
  rays = clamp(rays, 0.0, 1.0);
  vec3 rayColor = vec3(1.0, 0.95, 0.8) * rays * 0.4;
  distortedColor.rgb += rayColor * uMix;

  // === CENTERED GLOW AT TOP ===
  vec2 glowCenter = vec2(0.5, 1.2); // exact top center
  float glowRadius = 0.5;
  float glow = smoothstep(glowRadius, 0.0, distance(uv, glowCenter));
  vec3 glowColor = vec3(1.0, 0.95, 0.8) * glow * 0.4;
  distortedColor.rgb += glowColor * uMix;

  // Final mix with base
  gl_FragColor = mix(baseColor, distortedColor, uMix);
}
`;

export class HeatwavePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private customTime: number;
  public uMix: number;

  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: frag,
    });
    this.customTime = 0.0;
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
