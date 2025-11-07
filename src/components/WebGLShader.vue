<template>
  <div class="shader-container">
    <canvas ref="canvas" :width="width" :height="height"></canvas>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  vertexShader: {
    type: String,
    default: `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `
  },
  fragmentShader: {
    type: String,
    default: `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_offset;
      uniform float u_zoom;

      void main() {
        vec2 uv = (gl_FragCoord.xy / u_resolution) * u_zoom + u_offset;

        // Grille
        vec2 grid = fract(uv * 10.0);
        float line = step(0.95, grid.x) + step(0.95, grid.y);

        // Cercles animés
        vec2 center = floor(uv * 10.0) + 0.5;
        center = center / 10.0;
        float dist = length(uv - center);
        float circle = smoothstep(0.05, 0.04, dist);

        // Couleur basée sur la position
        vec3 color = vec3(fract(center.x), fract(center.y), sin(u_time + center.x + center.y) * 0.5 + 0.5);

        // Combinaison
        color = mix(vec3(0.1), color, circle);
        color = mix(color, vec3(1.0), line * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  }
});

const canvas = ref(null);
const error = ref('');
let gl = null;
let program = null;
let animationId = null;
let startTime = Date.now();

// Variables pour le déplacement
const offset = ref({ x: 0, y: 0 });
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
const zoom = ref(1.0);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Erreur compilation shader: ${info}`);
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Erreur link program: ${info}`);
  }

  return program;
}

function initWebGL() {
  error.value = '';

  try {
    gl = canvas.value.getContext('webgl') || canvas.value.getContext('experimental-webgl');

    if (!gl) {
      throw new Error('WebGL non supporté');
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, props.vertexShader);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, props.fragmentShader);
    program = createProgram(gl, vertShader, fragShader);

    // Buffer pour un rectangle plein écran
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1,  1,
      1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Démarrer l'animation
    render();

  } catch (e) {
    error.value = e.message;
    console.error(e);
  }
}

function render() {
  if (!gl || !program) return;

  const time = (Date.now() - startTime) / 1000;

  // Uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const offsetLocation = gl.getUniformLocation(program, 'u_offset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');

  if (resolutionLocation) {
    gl.uniform2f(resolutionLocation, props.width, props.height);
  }

  if (timeLocation) {
    gl.uniform1f(timeLocation, time);
  }

  if (offsetLocation) {
    gl.uniform2f(offsetLocation, offset.value.x, offset.value.y);
  }

  if (zoomLocation) {
    gl.uniform1f(zoomLocation, zoom.value);
  }

  gl.viewport(0, 0, props.width, props.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  animationId = requestAnimationFrame(render);
}

onMounted(() => {
  initWebGL();

  // Événements souris pour le déplacement
  const canvasEl = canvas.value;

  canvasEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
    canvasEl.style.cursor = 'grabbing';
  });

  canvasEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - lastMousePos.x) / props.width;
    const deltaY = (e.clientY - lastMousePos.y) / props.height;

    offset.value.x -= deltaX * zoom.value;
    offset.value.y += deltaY * zoom.value;

    lastMousePos = { x: e.clientX, y: e.clientY };
  });

  canvasEl.addEventListener('mouseup', () => {
    isDragging = false;
    canvasEl.style.cursor = 'grab';
  });

  canvasEl.addEventListener('mouseleave', () => {
    isDragging = false;
    canvasEl.style.cursor = 'grab';
  });

  // Zoom avec la molette
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Position de la souris en coordonnées normalisées
    const rect = canvasEl.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / props.width;
    const mouseY = (e.clientY - rect.top) / props.height;

    // Position dans l'espace monde avant le zoom
    const worldX = mouseX * zoom.value + offset.value.x;
    const worldY = mouseY * zoom.value + offset.value.y;

    // Appliquer le zoom
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    zoom.value *= zoomFactor;

    // Ajuster l'offset pour garder le point sous la souris fixe
    offset.value.x = worldX - mouseX * zoom.value;
    offset.value.y = worldY - mouseY * zoom.value;
  });

  canvasEl.style.cursor = 'grab';
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

watch(() => [props.vertexShader, props.fragmentShader], () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  startTime = Date.now();
  initWebGL();
});
</script>

<style scoped>

canvas {
  display: block;
  border: 1px solid #333;
}

.error {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>