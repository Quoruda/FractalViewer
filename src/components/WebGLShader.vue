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
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = (gl_FragCoord.xy / u_resolution) * u_zoom + u_offset;
        uv = uv * vec2(aspect, 1.0);

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

// Variables pour le tactile
let lastTouchDistance = 0;
let lastTouchCenter = { x: 0, y: 0 };

// Cache des uniform locations
let uniformLocations = {};

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

    // Cleanup des shaders après linking
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

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

    // Cache des uniform locations
    uniformLocations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      offset: gl.getUniformLocation(program, 'u_offset'),
      zoom: gl.getUniformLocation(program, 'u_zoom')
    };

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

  // Uniforms avec locations en cache
  if (uniformLocations.resolution) {
    gl.uniform2f(uniformLocations.resolution, props.width, props.height);
  }

  if (uniformLocations.time) {
    gl.uniform1f(uniformLocations.time, time);
  }

  if (uniformLocations.offset) {
    gl.uniform2f(uniformLocations.offset, offset.value.x, offset.value.y);
  }

  if (uniformLocations.zoom) {
    gl.uniform1f(uniformLocations.zoom, zoom.value);
  }

  gl.viewport(0, 0, props.width, props.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  animationId = requestAnimationFrame(render);
}

// Fonctions utilitaires pour le tactile
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

onMounted(() => {
  initWebGL();

  const canvasEl = canvas.value;

  // Événements souris pour le déplacement
  canvasEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
    canvasEl.style.cursor = 'grabbing';
  });

  canvasEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - lastMousePos.x) / props.width;
    const deltaY = (e.clientY - lastMousePos.y) / props.height;

    offset.value.x -= deltaX / zoom.value;
    offset.value.y += deltaY / zoom.value;

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

    const rect = canvasEl.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / props.width;
    const mouseY = 1.0 - (e.clientY - rect.top) / props.height;

    const worldX = mouseX / zoom.value + offset.value.x;
    const worldY = mouseY / zoom.value + offset.value.y;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = zoom.value * zoomFactor;

    offset.value.x = worldX - mouseX / newZoom;
    offset.value.y = worldY - mouseY / newZoom;

    zoom.value = newZoom;
  });

  // ===== ÉVÉNEMENTS TACTILES =====

  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Un doigt : déplacement
      isDragging = true;
      lastMousePos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Deux doigts : zoom
      isDragging = false;
      lastTouchDistance = getTouchDistance(e.touches);
      lastTouchCenter = getTouchCenter(e.touches);
    }
  }, { passive: false });

  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Déplacement avec un doigt
      const touch = e.touches[0];
      const deltaX = (touch.clientX - lastMousePos.x) / props.width;
      const deltaY = (touch.clientY - lastMousePos.y) / props.height;

      offset.value.x -= deltaX / zoom.value;
      offset.value.y += deltaY / zoom.value;

      lastMousePos = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // Pinch-to-zoom avec deux doigts
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches);

      // Calculer le facteur de zoom
      const zoomFactor = currentDistance / lastTouchDistance;

      // Position du centre en coordonnées normalisées
      const rect = canvasEl.getBoundingClientRect();
      const centerX = (currentCenter.x - rect.left) / props.width;
      const centerY = 1.0 - (currentCenter.y - rect.top) / props.height;

      // Position dans l'espace monde avant le zoom
      const worldX = centerX / zoom.value + offset.value.x;
      const worldY = centerY / zoom.value + offset.value.y;

      // Appliquer le zoom
      const newZoom = zoom.value * zoomFactor;

      // Ajuster l'offset pour garder le point central fixe
      offset.value.x = worldX - centerX / newZoom;
      offset.value.y = worldY - centerY / newZoom;

      zoom.value = newZoom;

      // Déplacement du centre pendant le pinch
      const centerDeltaX = (currentCenter.x - lastTouchCenter.x) / props.width;
      const centerDeltaY = (currentCenter.y - lastTouchCenter.y) / props.height;

      offset.value.x -= centerDeltaX / zoom.value;
      offset.value.y += centerDeltaY / zoom.value;

      lastTouchDistance = currentDistance;
      lastTouchCenter = currentCenter;
    }
  }, { passive: false });

  canvasEl.addEventListener('touchend', (e) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      isDragging = false;
    } else if (e.touches.length === 1) {
      // Retour au mode déplacement avec un seul doigt
      isDragging = true;
      lastMousePos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, { passive: false });

  canvasEl.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isDragging = false;
  }, { passive: false });

  canvasEl.style.cursor = 'grab';
  canvasEl.style.touchAction = 'none'; // Désactiver les gestes natifs du navigateur
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // Cleanup WebGL resources
  if (gl && program) {
    gl.deleteProgram(program);
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
  touch-action: none; /* Désactiver les gestes natifs */
  user-select: none; /* Empêcher la sélection de texte */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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