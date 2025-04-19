const frag = `
#define SHADER_NAME EARTH_SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
vec2 uv = outTexCoord;
vec4 color = texture2D(uMainSampler, uv);

// Control growth over time (initially no vines)
float speed = 0.2;
float growTime = time * speed;

// Growth factor for vines, starts at 0.0 and grows to 1.0 over time
float growthFactor = smoothstep(0.0, 1.0, fract(growTime));

// Base vine paths (sine waves for different vines)
float y = uv.y;
float vineX1 = 0.5 + sin(y * 10.0 + growTime * 2.0) * 0.1; // Main vine
float vineX2 = 0.3 + sin(y * 10.0 + growTime * 1.5) * 0.15; // Second vine
float vineX3 = 0.7 + sin(y * 10.0 + growTime * 1.8) * 0.12; // Third vine

// Growth mask: only grow up to a certain Y over time, based on growthFactor
float growHeight = fract(growTime) * growthFactor; // gradually increases from 0.0 to 1.0
float growthMask = smoothstep(growHeight, growHeight + 0.02, y);

// Draw main vine line
float distToVine1 = abs(uv.x - vineX1);
float distToVine2 = abs(uv.x - vineX2);
float distToVine3 = abs(uv.x - vineX3);

float mainVine1 = smoothstep(0.01, 0.0, distToVine1) * growthMask;
float mainVine2 = smoothstep(0.01, 0.0, distToVine2) * growthMask;
float mainVine3 = smoothstep(0.01, 0.0, distToVine3) * growthMask;

// Optional: Add branches to each vine
float branchOffset1 = sin(y * 15.0 + growTime * 3.0) * 0.02;
float branchOffset2 = sin(y * 15.0 + growTime * 2.5) * 0.025;
float branchOffset3 = sin(y * 15.0 + growTime * 2.8) * 0.018;

float branch1 = smoothstep(0.008, 0.0, abs(uv.x - (vineX1 + branchOffset1))) * growthMask * 0.7;
float branch2 = smoothstep(0.008, 0.0, abs(uv.x - (vineX2 + branchOffset2))) * growthMask * 0.7;
float branch3 = smoothstep(0.008, 0.0, abs(uv.x - (vineX3 + branchOffset3))) * growthMask * 0.7;

// Leaf effect: add small leaves along the vines
float leafSize = 0.02;
float leafDist1 = abs(uv.x - vineX1);
float leafDist2 = abs(uv.x - vineX2);
float leafDist3 = abs(uv.x - vineX3);

float leaf1 = smoothstep(leafSize, leafSize - 0.01, leafDist1) * growthMask * 0.5;
float leaf2 = smoothstep(leafSize, leafSize - 0.01, leafDist2) * growthMask * 0.5;
float leaf3 = smoothstep(leafSize, leafSize - 0.01, leafDist3) * growthMask * 0.5;

// Total vine effect
float vine1 = mainVine1 + branch1 + leaf1;
float vine2 = mainVine2 + branch2 + leaf2;
float vine3 = mainVine3 + branch3 + leaf3;

// Color blending: overlay green vine color with leaves (slightly different shade for leaves)
vec3 vineColor = vec3(0.1, 0.3, 0.1);
vec3 leafColor = vec3(0.2, 0.6, 0.1); // Slightly brighter green for leaves

// Apply vine colors and leaf colors
color.rgb = mix(color.rgb, vineColor, vine1);
color.rgb = mix(color.rgb, vineColor, vine2);
color.rgb = mix(color.rgb, vineColor, vine3);

// Blend leaves with their respective vines
color.rgb = mix(color.rgb, leafColor, leaf1);
color.rgb = mix(color.rgb, leafColor, leaf2);
color.rgb = mix(color.rgb, leafColor, leaf3);

// Final color
gl_FragColor = color;

}
`;

export class EarthShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private customTime: number;

  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: frag,
    });
    this.customTime = 0;
  }

  set currentTime(val: number) {
    this.customTime = val;
  }

  onPreRender() {
    this.set1f('time', this.customTime);
  }
}
