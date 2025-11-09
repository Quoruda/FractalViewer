import { createRouter, createWebHistory } from 'vue-router'
import JuliaFractalView from "@/views/JuliaFractalView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes:[
    {
      path: '/julia',
      name: 'julia',
      component: JuliaFractalView,
    },
    {
        path: '/',
        redirect: '/julia',
    }
  ],
})

export default router
