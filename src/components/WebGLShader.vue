<template>
  <div class="shader-container">
    <canvas ref="canvas" :width="width" :height="height"></canvas>

    <!-- Messages d'erreur -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Warnings (non bloquants) -->
    <div v-if="warnings.length && showWarning > 0" class="warnings">
      <div v-for="(warning, i) in warnings" :key="i">⚠️ {{ warning }}</div>
    </div>

    <!-- Info renderer -->
    <div v-if="showRendererInfo && currentRenderer" class="renderer-info">
      🎨 {{ currentRenderer.toUpperCase() }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { RendererFactory } from './rendererFactory.js';

const props = defineProps({
  // Shaders GLSL (WebGL)
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
        vec2 uv = (gl_FragCoord.xy / u_resolution) / u_zoom + u_offset;
        uv = uv * vec2(aspect, 1.0);

        vec2 grid = fract(uv * 10.0);
        float line = step(0.95, grid.x) + step(0.95, grid.y);

        vec2 center = floor(uv * 10.0) + 0.5;
        center = center / 10.0;
        float dist = length(uv - center);
        float circle = smoothstep(0.05, 0.04, dist);

        vec3 color = vec3(fract(center.x), fract(center.y), sin(u_time + center.x + center.y) * 0.5 + 0.5);
        color = mix(vec3(0.1), color, circle);
        color = mix(color, vec3(1.0), line * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  },

  showWarning: {
    type: Boolean,
    default: false
  },

  // Shaders WGSL (WebGPU) - optionnels
  wgslVertexShader: {
    type: String,
    default: null
  },
  wgslFragmentShader: {
    type: String,
    default: null
  },

  // Dimensions
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },

  // Choix du renderer
  renderer: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'webgl', 'webgpu'].includes(value)
  },

  // Afficher les infos de renderer
  showRendererInfo: {
    type: Boolean,
    default: false
  },

  customUniforms: {
    type: Object,
    default: () => ({})
  },

  zoomImpactOnOffset: {
    type: Boolean,
    default: true
  }
});

const canvas = ref(null);
const error = ref('');
const warnings = ref([]);
const currentRenderer = ref(null);

let renderer = null;
let animationId = null;
let startTime = Date.now();

// Interactions
const offset = ref({ x: 0, y: 0 });
const zoom = ref(1.0);
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
let lastTouchDistance = 0;
let lastTouchCenter = { x: 0, y: 0 };

// Computed
const hasWGSL = computed(() => {
  return !!(props.wgslFragmentShader || props.wgslVertexShader);
});

async function initRenderer() {
  error.value = '';
  warnings.value = [];

  try {
    const result = await RendererFactory.create(canvas.value, {
      preferredRenderer: props.renderer,
      hasWGSL: hasWGSL.value,
      wgslVertex: props.wgslVertexShader,
      wgslFragment: props.wgslFragmentShader
    });

    renderer = result.renderer;
    warnings.value = result.warnings;
    currentRenderer.value = result.selectedType;

    const shaders = currentRenderer.value === 'webgpu'
        ? {
          vertex: props.wgslVertexShader,
          fragment: props.wgslFragmentShader
        }
        : {
          vertex: props.vertexShader,
          fragment: props.fragmentShader
        };

    if (currentRenderer.value === 'webgl') {
      await renderer.initialize(shaders);
    }

    render();

  } catch (e) {
    error.value = `Erreur d'initialisation: ${e.message}`;
    console.error('Renderer initialization failed:', e);

    if (currentRenderer.value !== 'webgl' && !renderer) {
      try {
        console.warn('Tentative de fallback WebGL de secours...');
        renderer = new (await import('./WebGLRenderer.js')).WebGLRenderer(canvas.value);
        await renderer.initialize({
          vertex: props.vertexShader,
          fragment: props.fragmentShader
        });
        currentRenderer.value = 'webgl';
        warnings.value.push('Fallback vers WebGL de secours');
        error.value = '';
        render();
      } catch (fallbackError) {
        error.value = `Impossible d'initialiser un renderer: ${fallbackError.message}`;
      }
    }
  }
}

function render() {
  if (!renderer) return;

  const time = (Date.now() - startTime) / 1000;

  renderer.setUniforms({
    resolution: { x: props.width, y: props.height },
    time: time,
    offset: offset.value,
    zoom: zoom.value,
    ...props.customUniforms
  });

  renderer.render();
  console.log(props.zoomImpactOnOffset)
  animationId = requestAnimationFrame(render);
}

// Fonctions tactiles
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

// Fonction helper pour calculer le diviseur d'offset selon zoomImpactOnOffset
function getOffsetDivisor() {
  return props.zoomImpactOnOffset ? zoom.value : 1.0;
}

onMounted(async () => {
  await initRenderer();

  const canvasEl = canvas.value;

  // Événements souris
  canvasEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
    canvasEl.style.cursor = 'grabbing';
  });

  canvasEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - lastMousePos.x) / props.width;
    const deltaY = (e.clientY - lastMousePos.y) / props.height;

    const divisor = getOffsetDivisor();
    offset.value.x -= deltaX / divisor;
    offset.value.y += deltaY / divisor;

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

  // Zoom molette
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();

    const rect = canvasEl.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / props.width;
    const mouseY = 1.0 - (e.clientY - rect.top) / props.height;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = zoom.value * zoomFactor;

    if (props.zoomImpactOnOffset) {
      // Mode classique : zoom influence l'offset (zoom vers la souris)
      const worldX = mouseX / zoom.value + offset.value.x;
      const worldY = mouseY / zoom.value + offset.value.y;

      offset.value.x = worldX - mouseX / newZoom;
      offset.value.y = worldY - mouseY / newZoom;
    }
    // Si zoomImpactOnOffset est false, on change juste le zoom sans toucher à l'offset

    zoom.value = newZoom;
  });

  // Événements tactiles
  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      isDragging = true;
      lastMousePos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      isDragging = false;
      lastTouchDistance = getTouchDistance(e.touches);
      lastTouchCenter = getTouchCenter(e.touches);
    }
  }, { passive: false });

  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - lastMousePos.x) / props.width;
      const deltaY = (touch.clientY - lastMousePos.y) / props.height;

      const divisor = getOffsetDivisor();
      offset.value.x -= deltaX / divisor;
      offset.value.y += deltaY / divisor;

      lastMousePos = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches);

      const zoomFactor = currentDistance / lastTouchDistance;
      const newZoom = zoom.value * zoomFactor;

      if (props.zoomImpactOnOffset) {
        // Mode classique : zoom influence l'offset
        const rect = canvasEl.getBoundingClientRect();
        const centerX = (currentCenter.x - rect.left) / props.width;
        const centerY = 1.0 - (currentCenter.y - rect.top) / props.height;

        const worldX = centerX / zoom.value + offset.value.x;
        const worldY = centerY / zoom.value + offset.value.y;

        offset.value.x = worldX - centerX / newZoom;
        offset.value.y = worldY - centerY / newZoom;

        // Pan avec le centre du pincement
        const centerDeltaX = (currentCenter.x - lastTouchCenter.x) / props.width;
        const centerDeltaY = (currentCenter.y - lastTouchCenter.y) / props.height;

        offset.value.x -= centerDeltaX / newZoom;
        offset.value.y += centerDeltaY / newZoom;
      } else {
        // Mode sans impact : on applique quand même le pan du centre
        const centerDeltaX = (currentCenter.x - lastTouchCenter.x) / props.width;
        const centerDeltaY = (currentCenter.y - lastTouchCenter.y) / props.height;

        offset.value.x -= centerDeltaX;
        offset.value.y += centerDeltaY;
      }

      zoom.value = newZoom;

      lastTouchDistance = currentDistance;
      lastTouchCenter = currentCenter;
    }
  }, { passive: false });

  canvasEl.addEventListener('touchend', (e) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      isDragging = false;
    } else if (e.touches.length === 1) {
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
  canvasEl.style.touchAction = 'none';
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
});

watch(() => [props.vertexShader, props.fragmentShader, props.wgslVertexShader, props.wgslFragmentShader, props.renderer], async () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  startTime = Date.now();
  await initRenderer();
});
</script>

<style scoped>
.shader-container {
  position: relative;
}

canvas {
  display: block;
  border: 1px solid #333;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.error {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  z-index: 100;
}

.warnings {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: rgba(255, 165, 0, 0.9);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-family: sans-serif;
  font-size: 12px;
  z-index: 99;
}

.warnings > div {
  margin: 4px 0;
}

.renderer-info {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #0f0;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
  font-weight: bold;
  z-index: 98;
}
</style>