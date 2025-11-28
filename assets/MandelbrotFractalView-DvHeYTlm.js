import{F as o}from"./FullScreenShader-uZ4b5job.js";import{a as e,d as a}from"./index-frrM4VUH.js";const t=`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
const int MAX_ITER = 1500;
float maxLimit = 4.0;

vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution ) / u_zoom + u_offset;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z;
  vec2 c = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    if (i >= MAX_ITER) break;
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      vec3 coldColor = vec3(0.10, 0.18, 0.32);
      vec3 warmColor = vec3(0.90, 0.60, 0.45);

      float t = float(i) / float(MAX_ITER);
      t = 0.5 + 0.5 * sin(6.2831 * t * 1.5);  // Crée des oscillations subtiles
      vec3 color = mix(coldColor, warmColor, t);


      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`,n={__name:"MandelbrotFractalView",setup(r){return(l,c)=>(a(),e(o,{fragmentShader:t}))}};export{n as default};
