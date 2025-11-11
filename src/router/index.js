import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes:[
      {
          path: '/',
          name: 'julia',
            component: () => import('@/views/JuliaFractalView.vue'),
      },
    {
      path: '/julia',
      name: 'julia',
      component: () => import('@/views/JuliaFractalView.vue'),
    },
    {
        path: '/mandelbrot',
        name: 'mandelbrot',
        component: () => import('@/views/MandelbrotFractalView.vue'),
    },
    {
        path: '/burningship',
        name: 'burningship',
        component: () => import('@/views/BurningShipFractalView.vue'),
    }
  ],
})

export default router
