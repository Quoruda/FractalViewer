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


defineProps({
  fragmentShader: {
    type: String,
    required: false,
    default: `
    precision highp float;
    uniform vec2 u_resolution;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution;
      gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(uv.x * 10.0), 1.0);
    }
    `
  },
  fragmentShaderWGSL: {
    type: String,
    required: false,
    default: null
  },

  customUniforms: {
    type: Object,
    default: () => ({})
  }
})

</script>

<template>
  <WebGLShader class="fullscreen-shader" v-if="fragmentShaderWGSL != null"
      :width="width"
      :height="height"
      :fragmentShader="fragmentShader"
      :wgslFragmentShader="fragmentShaderWGSL"
      :customUniforms="customUniforms"
  />
  <WebGLShader class="fullscreen-shader" v-else
      :width="width"
      :height="height"
      :fragmentShader="fragmentShader"
      :custom-uniforms="customUniforms"
  />



  <div class="layout-container">
    <slot>

    </slot>
  </div>


</template>

<style scoped>

.fullscreen-shader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.layout-container {
  position: fixed;
  margin: 10px;
  padding: 0;
  top: 0;
  left: 0;
  z-index: 2;
}

</style>