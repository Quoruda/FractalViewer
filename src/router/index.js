import { createRouter, createWebHistory } from 'vue-router'
import FractalView from "@/views/FractalView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/fractal',
      name: 'fractal',
      component: FractalView,
    },
  ],
})

export default router
