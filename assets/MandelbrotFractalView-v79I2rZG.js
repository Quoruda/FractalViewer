import{F as e}from"./FullScreenShader-d2qQdIUV.js";import{c as a,f as t,o as r}from"./index-C0F7Rtko.js";const m={__name:"MandelbrotFractalView",setup(i){const o=a(()=>`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
int dynamicMaxIterations  = int(120.0 + 60.0 * log(u_zoom + 1.0));
const int MAX_ITER = 800;

float maxLimit = 256.0;
const int maxIterations = 800;

vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution ) / u_zoom + u_offset;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z = vec2(0.0, 0.0);
  vec2 c = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    if (i >= dynamicMaxIterations) break;
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      vec3 coldColor = vec3(0.10, 0.18, 0.32);
      vec3 warmColor = vec3(0.90, 0.60, 0.45);

      float t = float(i) / float(dynamicMaxIterations);
      t = 0.5 + 0.5 * sin(6.2831 * t * 1.5);  // Crée des oscillations subtiles
      vec3 color = mix(coldColor, warmColor, t);


      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`);return(c,l)=>(r(),t(e,{fragmentShader:o.value},null,8,["fragmentShader"]))}};export{m as default};
