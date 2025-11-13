<script setup>

import FullScreenShader from "@/components/FullScreenShader.vue";

const mandelbrotShader = `
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
`;

const mandelbrotShaderDoublePrecision = `
precision highp float;

// ---------------------------------------------
// Simulation d'un double via deux floats (high, low)
// ---------------------------------------------

// Crée un "double" à partir d'un float
vec2 double_from_float(float a) {
    return vec2(a, 0.0);
}

// Addition de deux "doubles"
vec2 double_add(vec2 a, vec2 b) {
    float s = a.x + b.x;
    float v = s - a.x;
    float t = ((b.x - v) + (a.x - (s - v))) + a.y + b.y;
    return vec2(s + t, t - ((s + t) - s));
}

// Soustraction
vec2 double_sub(vec2 a, vec2 b) {
    b.x = -b.x;
    b.y = -b.y;
    return double_add(a, b);
}

// Multiplication
vec2 double_mul(vec2 a, vec2 b) {
    float c11 = a.x * b.x;
    float c21 = a.x * b.y + a.y * b.x;
    float c2  = a.y * b.y;
    float t1 = c11 + c21;
    float e  = t1 - c11;
    float t2 = ((c21 - e) + (c11 - (t1 - e))) + c2;
    return vec2(t1 + t2, t2 - ((t1 + t2) - t1));
}

// Division (approchée)
vec2 double_div(vec2 a, vec2 b) {
    float inv = 1.0 / b.x;
    vec2 q = double_from_float(a.x * inv);
    vec2 prod = double_mul(b, q);
    vec2 diff = double_sub(a, prod);
    vec2 corr = double_from_float(diff.x * inv);
    return double_add(q, corr);
}

// Conversion double → float
float double_to_float(vec2 a) {
    return a.x + a.y;
}

const int MAX_ITER = 1000;
const int MAX_LIMIT = 4.0;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;



void main(){
  vec2 ds_offset_x = double_from_float(u_offset.x);
  vec2 ds_offset_y = double_from_float(u_offset.y);
  vec2 ds_zoom = double_from_float(u_zoom);
  vec2 ds_aspect = double_from_float(u_resolution.x / u_resolution.y);

  vec2 ds_coord_x = double_div(double_from_float(gl_FragCoord.x), double_from_float(u_resolution.x));
  vec2 ds_coord_y = double_div(double_from_float(gl_FragCoord.y), double_from_float(u_resolution.y));
  ds_coord_x = double_div(ds_coord_x, ds_zoom);
  ds_coord_y = double_div(ds_coord_y, ds_zoom);
  ds_coord_x = double_add(ds_coord_x, ds_offset_x);
  ds_coord_y = double_add(ds_coord_y, ds_offset_y);

  vec2 z_r = double_from_float(0.0);
  vec2 z_i = double_from_float(0.0);

  vec2 c_r = double_mul(double_sub(double_mul(double_from_float(4.0), ds_coord_x), double_from_float(2.0)), ds_aspect);
  vec2 c_i = double_sub(double_mul(double_sub(double_mul(double_from_float(4.0), ds_coord_y), double_from_float(2.0)), double_from_float(1.0));
  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    if (i >= MAX_ITER) break;
    // z = z * z + c
    vec2 z_r2 = double_mul(z_r, z_r);
    vec2 z_i2 = double_mul(z_i, z_i);
    vec2 z_ri = double_mul(z_r, z_i);
    z_r = double_add(double_sub(z_r2, z_i2), c_r);
    z_i = double_add(double_mul(double_from_float(2.0), z_ri), c_i);

    magnitude = double_to_float(double_add(double_mul(z_r, z_r), double_mul(z_i, z_i)));

    if(magnitude > MAX_LIMIT){
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

`


const mandelbrotShaderWGSL = `
// Active l'extension float64 (si disponible)
enable f16;

const MAX_ITER: i32 = 2000;  // Plus d'itérations possibles avec f64
const MAX_LIMIT: f32 = 4.0;

// Fonctions en haute précision
fn multiplyComplexHP(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  // Simulation double précision via algorithme de Kahan
  let x1 = a.x * b.x;
  let x2 = a.y * b.y;
  let y1 = a.x * b.y;
  let y2 = a.y * b.x;

  return vec2<f32>(x1 - x2, y1 + y2);
}

fn magnitudeSquared(v: vec2<f32>) -> f32 {
  return v.x * v.x + v.y * v.y;
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = (fragCoord.xy / uniforms.resolution) / uniforms.zoom + uniforms.offset;
  let aspect = uniforms.resolution.x / uniforms.resolution.y;

  var z = vec2<f32>(0.0, 0.0);
  let c = (uv * 4.0 - vec2<f32>(2.0, 2.0)) * vec2<f32>(aspect, 1.0);

  var magnitude: f32;
  var finalColor = vec4<f32>(0.0, 0.0, 0.0, 1.0);

  for (var i = 0; i < MAX_ITER; i++) {
    z = multiplyComplexHP(z, z) + c;
    magnitude = magnitudeSquared(z);

    if (magnitude > MAX_LIMIT) {
      let coldColor = vec3<f32>(0.10, 0.18, 0.32);
      let warmColor = vec3<f32>(0.90, 0.60, 0.45);

      var t = f32(i) / f32(MAX_ITER);
      t = 0.5 + 0.5 * sin(6.2831 * t * 1.5);
      let color = mix(coldColor, warmColor, t);

      finalColor = vec4<f32>(color, 1.0);
      break;
    }
  }

  return finalColor;
}
`;


</script>


<template>
  <FullScreenShader :fragmentShader="mandelbrotShader" >

  </FullScreenShader>
</template>

<style>

</style>

