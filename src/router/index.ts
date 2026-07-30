import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'select-index',
      component: () => import('@/components/SelectIndex.vue'), // 🌟 請依據你實際的專案路徑調整
      meta: { 
        transition: 'page-fade' // 🌟 標記：只要切換到此路由，就啟動由左至右閃過效果
      },
    },
    {
      path: '/vol/:id',
      name: 'magazine',
      component: () => import('@/components/Magazine.vue'), // 🌟 帶有動態 :id 的雜誌內頁
    },
    {
    path: '/development',
    name: 'development',
    component: () => import('@/components/WorksIndex.vue'), 
    meta: { 
      transition: 'page-fade' // 🌟 標記：只要切換到此路由，就啟動由左至右閃過效果
    },
  },
  ],
})

export default router