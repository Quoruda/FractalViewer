import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes:[
      {
          path: '/',
          name: 'home',
            component: () => import('@/views/JuliaFractalView.vue'),
          props: { demo: true },

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
    },
      {
          path: '/mandelbox',
            name: 'mandelbox',
            component: () => import('@/views/MandelBoxFractalView.vue'),
      }
  ],
})

export default router
