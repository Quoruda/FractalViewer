<script setup>

import FullScreenShader from "@/components/FullScreenShader.vue";
import {computed, ref} from "vue";
import RangeSlider from "@/components/RangeSlider.vue";

const  r = ref(-1);
const i = ref(0);

const juliaShader = computed(() => `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
vec2 c = vec2(${r.value}, ${i.value});
const float maxLimit = 64.0;
const int MAX_ITER = 1000;
int dynamicMaxIterations  = int(80.0 + 60.0 * log(u_zoom + 1.0));


vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution ) / u_zoom + u_offset;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    if (i >= dynamicMaxIterations) break;
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      vec3 coldColor = vec3(1.00, 0.50, 0.25);
      vec3 warmColor = vec3(0.08, 0.20, 0.35);

      float t = float(i) / float(dynamicMaxIterations);
      t = 0.5 + 0.5 * sin(6.2831 * t * 1.5);  // Crée des oscillations subtiles
      vec3 color = mix(coldColor, warmColor, t);


      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`);




</script>


<template>
  <FullScreenShader :fragmentShader="juliaShader">
    <RangeSlider
        v-model="r"
        :min="-1"
        :max="1"
        :step="0.001"
        :decimals="3"
        label="Partie réelle"
    />

    <RangeSlider
        v-model="i"
        :min="-1"
        :max="1"
        :step="0.001"
        :decimals="3"
        label="Partie imaginaire"
    />
  </FullScreenShader>
</template>

<style>

</style>

