<script setup>

import FullScreenShader from "@/components/FullScreenShader.vue";
import {computed, ref, watch, onUnmounted} from "vue";
import RangeSlider from "@/components/RangeSlider.vue";

const r = ref(-1);
const i = ref(0);
const demoMode = ref(false);

let animationId = null;
let startTime = null;

// Collection de paramètres Julia intéressants
const interestingJuliaSets = [
  // Classiques célèbres - dendrites et structures principales
  { r: -0.7269, i: 0.1889 },      // Dendrite de Douady
  { r: -0.8, i: 0.156 },          // Dragon de Douady
  { r: -0.162, i: 1.04 },         // Lapin de Douady
  { r: -0.12, i: 0.74 },          // San Marco fractal
  { r: -0.391, i: -0.587 },       // Siegel disk

  // Spirales - région positive
  { r: 0.285, i: 0.01 },          // Spirale simple
  { r: 0.45, i: 0.1428 },         // Spirale complexe
  { r: -0.70176, i: -0.3842 },    // Spirale de Douady

  // Formes florales - bien espacées
  { r: -0.4, i: 0.6 },            // Fleur à 5 pétales
  { r: 0.3, i: 0.5 },             // Branches florales
  { r: -0.54, i: 0.54 },          // Fleur diagonale
  { r: -0.1, i: 0.651 },          // Fleur de corail

  // Formes géométriques
  { r: 0.4, i: 0.2 },             // Feuille
  { r: -0.7, i: 0.27015 },        // Forme connectée
  { r: -0.835, i: -0.2321 },      // Triangle
  { r: -0.8, i: 0.0 },            // Forme en H

  // Formes organiques
  { r: -0.79, i: 0.15 },          // Ver
  { r: 0.0, i: 0.8 },             // Arbre
  { r: -0.4, i: -0.59 },          // Salamandre
  { r: -1.476, i: 0.0 },          // Étoile de mer

  // Formes complexes
  { r: 0.27334, i: 0.00742 },     // Galaxie
  { r: -0.038088, i: 0.9754633 }, // Plume
  { r: -0.11, i: 0.6557 },        // Toile d'araignée
  { r: -0.194, i: 0.6557 },       // Cristal de glace

  // Points sur le bord du chaos
  { r: -0.75, i: 0.11 },          // Presque dragon
  { r: 0.28, i: 0.008 },          // Spirale fine
  { r: -0.481762, i: -0.531657 }, // Constellation

  // Formes symétriques
  { r: 0.0, i: 1.0 },             // Symétrie verticale
  { r: -1.0, i: 0.0 },            // Symétrie horizontale
  { r: 0.32, i: 0.043 },          // Double spirale
  { r: -0.618, i: 0.0 },          // Nombre d'or

  // Chaos intéressant
  { r: -0.4, i: -0.6 },           // Chaos contrôlé
  { r: 0.34, i: -0.05 },          // Turbulence
  { r: -0.123, i: 0.745 },        // Fractale de Fatou

  // Formes rares et distinctes
  { r: -1.25, i: 0.0 },           // Grande étoile
  { r: 0.0, i: -0.8 },            // Arbre inversé
  { r: -0.75, i: 0.0 },           // Croix de Malte
  { r: 0.28, i: -0.53 },          // Hélice

  // Ensembles circulaires
  { r: -0.12256, i: 0.74486 },    // Presque cercle
  { r: -0.7, i: 0.3 },            // Ovale
  { r: 0.28, i: 0.53 },           // Lentille
];


const updateDemo = (timestamp) => {
  if (!startTime) startTime = timestamp;
  const elapsed = (timestamp - startTime) / 1000;

  // Durée de chaque ensemble (en secondes)
  const setDuration = 1;
  // Durée de transition entre ensembles
  const transitionDuration = 2;

  const totalDuration = setDuration + transitionDuration;
  const cyclePosition = (elapsed % (totalDuration * interestingJuliaSets.length)) / totalDuration;

  const currentIndex = Math.floor(cyclePosition);
  const nextIndex = (currentIndex + 1) % interestingJuliaSets.length;

  const localTime = cyclePosition - currentIndex;

  let t;
  if (localTime < setDuration / totalDuration) {
    // Phase statique : rester sur l'ensemble actuel
    t = 0;
  } else {
    // Phase de transition : interpolation fluide vers le suivant
    const transitionProgress = (localTime - setDuration / totalDuration) / (transitionDuration / totalDuration);
    // Utilise une fonction d'easing pour une transition plus douce
    t = transitionProgress < 0.5
        ? 2 * transitionProgress * transitionProgress
        : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;
  }

  const current = {r: r.value, i: i.value};
  const next = interestingJuliaSets[nextIndex];

  // Interpolation entre les deux ensembles
  r.value = current.r + (next.r - current.r) * t;
  i.value = current.i + (next.i - current.i) * t;

  if (demoMode.value) {
    animationId = requestAnimationFrame(updateDemo);
  }
};

watch(demoMode, (newValue) => {
  if (newValue) {
    startTime = null;
    animationId = requestAnimationFrame(updateDemo);
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

const props = defineProps({
  demo : {
    type: Boolean,
    default: false
  }
});

if (props.demo) {
  demoMode.value = true;
  startTime = null;
  animationId = requestAnimationFrame(updateDemo);
}


const juliaShader = computed(() => `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_i;
uniform float u_r;
vec2 c = vec2(u_r, u_i);
const float maxLimit = 4.0;
const int MAX_ITER = 600;


vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

// Fonction pour convertir HSV en RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution ) / u_zoom + u_offset;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      float t = float(i) / float(MAX_ITER);

      // Lissage pour des transitions plus douces
      float log_zn = log(magnitude) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      t = (float(i) + 1.0 - nu) / float(MAX_ITER);

      // Créer un dégradé de couleurs harmonieux
      float hue = fract(t * 2.0);
      float saturation = 0.65 + 0.15 * sin(t * 20.0);
      float brightness = 0.5 + 0.4 * sin(t * 15.0);

      vec3 color = hsv2rgb(vec3(hue, saturation, brightness));

      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`);

</script>

<template>
  <FullScreenShader :fragmentShader="juliaShader" :custom-uniforms="{ r: r, i:i }">
    <RangeSlider
        v-model="r"
        :min="-2"
        :max="2"
        :step="0.0001"
        :decimals="3"
        label="Partie réelle"
        :disabled="demoMode"
    />

    <RangeSlider
        v-model="i"
        :min="-2"
        :max="2"
        :step="0.0001"
        :decimals="3"
        label="Partie imaginaire"
        :disabled="demoMode"
    />

    <div style="margin-top: 1rem; margin-left: 10px">
      <!-- Label avec checkbox masquée + élément visuel personnalisé -->
      <label class="demo-toggle" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input
            type="checkbox"
            v-model="demoMode"
            class="demo-checkbox-input"
            aria-label="Activer le mode démonstration"
        />
        <span class="demo-custom" aria-hidden="true"></span>
        <span class="demo-label" style="user-select: none;">Mode démonstration</span>
      </label>
    </div>
  </FullScreenShader>
</template>

<style scoped>
/* Style de la checkbox personnalisée */
.demo-toggle { gap: 0.5rem; }
.demo-checkbox-input {
  /* Cacher l'input natif mais le garder focusable/accesssible */
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
}

.demo-custom {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid rgba(0,0,0,0.45);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 180ms ease;
  box-sizing: border-box;
  flex: none;
}

/* Le petit tick (créé avec une bordure diagonale) */
.demo-custom::after {
  content: '';
  display: block;
  width: 8px;
  height: 5px;
  border-left: 2.5px solid transparent;
  border-bottom: 2.5px solid transparent;
  transform: rotate(-45deg) scale(0);
  transform-origin: center;
  transition: transform 120ms ease-in-out, border-color 120ms ease-in-out;
}

/* Etat coché */
.demo-checkbox-input:checked + .demo-custom {
  background: linear-gradient(135deg, #b794f6 0%, #a78bfa 100%);
  border-color: transparent;
}

.demo-checkbox-input:checked + .demo-custom::after {
  border-left-color: white;
  border-bottom-color: white;
  transform: rotate(-45deg) scale(1);
}



/* Texte du label en blanc */
.demo-label {
  color: #ffffff;
}
</style>