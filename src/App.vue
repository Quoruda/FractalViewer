<script setup>
import { RouterView } from 'vue-router'
import { ref } from "vue";

const showNav = ref(true);

const links = [
  { name: 'Julia Fractal', path: '/julia' },
  { name: 'Mandelbrot Fractal', path: '/mandelbrot' },
  { name: 'Burning Ship', path: '/burningship' },
  { name: 'Mandelbox (3D)', path: '/mandelbox' },
]
</script>

<template>
  <div class="app">
    <button class="showNavBtn" @click="showNav = !showNav">
      <span v-if="showNav">✕</span>
      <span v-else>☰</span>
    </button>

    <transition name="fade">
      <div class="home" v-if="showNav">
        <div class="content-wrapper">
          <h1 class="title">Visualisateur de fractales</h1>
          <p class="subtitle">
            Ici tu pourras observer différentes fractales, d'étranges et magnifiques
            structures mathématiques. N'hésite pas à te déplacer et à zoomer pour
            observer leurs particularités.
          </p>

          <ul class="links">
            <li v-for="link in links" :key="link.path">
              <router-link :to="link.path" class="link-btn" active-class="active">
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>

  <RouterView />
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.showNavBtn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  cursor: pointer;
  pointer-events: auto;
  background: rgba(15, 15, 25, 0.85);
  border: 1px solid rgba(139, 92, 246, 0.6);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.2s ease;
  backdrop-filter: blur(3px);
}

.showNavBtn:hover {
  background: rgba(139, 92, 246, 0.7);
  border-color: rgba(167, 139, 250, 0.8);
}

.showNavBtn:active {
  transform: scale(0.98);
}

.home {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.content-wrapper {
  max-width: 700px;
  padding: 40px;
  text-align: center;
}

.title {
  font-family: 'Georgia', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 1.15rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 40px 0;
  font-weight: 300;
}

.links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.link-btn {
  display: block;
  padding: 16px 35px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 12px;
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(3px);
}

.link-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(167, 139, 250, 0.8);
  transform: translateY(-2px);
}

.link-btn:active {
  transform: translateY(0);
}

.link-btn.active {
  background: rgba(139, 92, 246, 0.4);
  border-color: rgba(167, 139, 250, 1);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 20px;
  }

  .link-btn {
    font-size: 1.1rem;
    padding: 16px 30px;
  }
}
</style>