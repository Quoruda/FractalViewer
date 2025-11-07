<script setup>

import WebGLShader from "@/components/WebGLShader.vue";
import {onMounted, onUnmounted, ref} from "vue";


const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

function updateSize() {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

const myFragmentShader = `
precision highp float;
uniform vec2 u_resolution;
vec2 c = vec2(-1, 0);
float maxLimit = 4.0;

vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude = magnitudeSquared(z);
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  for(int i = 0; i < 100; i++){
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      break;
    }
  }
}

`;

</script>


<template>
  <WebGLShader class="background"
               :fragment-shader="myFragmentShader"
               :width="width"
               :height="height"/>
</template>

<style>
.background {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>

