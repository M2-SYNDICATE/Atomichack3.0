import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginPage from '@/pages/LoginPage.vue'

const accessMap: Record<string, string[]> = {
  developer: ['/', '/history', '/process-analysis', '/statistics-on-comments', '/result'],
  norm_controller: [
    '/history/norm-controller',
    '/result/norm-controller',
    '/process-analysis/norm-controller',
    '/statistics-on-comments/norm-controller',
    '/analysis/author',
  ],
  admin: ['/admin'],
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage, meta: { requiresGuest: true } },

    // Разработчик
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: { requiresAuth: true, roles: ['developer'] },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/pages/HistoryPage.vue'),
      meta: { requiresAuth: true, roles: ['developer'] },
    },
    {
      path: '/process-analysis',
      name: 'process-analysis',
      component: () => import('@/pages/ProcessAnalysisPage.vue'),
      meta: { requiresAuth: true, roles: ['developer'] },
    },
    {
      path: '/statistics-on-comments',
      name: 'statistics-on-comments',
      component: () => import('@/pages/StatisticsOnCommentsPage.vue'),
      meta: { requiresAuth: true, roles: ['developer'] },
    },
    {
      path: '/result/:id',
      name: 'result',
      component: () => import('@/pages/ResultPage.vue'),
      meta: { requiresAuth: true, roles: ['developer'] },
      props: true,
    },

    // Нормоконтролёр
    {
      path: '/history/norm-controller',
      name: 'history-norm-controller',
      component: () => import('@/pages/HistoryPageNorm.vue'),
      meta: { requiresAuth: true, roles: ['norm_controller'] },
    },
    {
      path: '/result/norm-controller/:id',
      name: 'result-norm-controller',
      component: () => import('@/pages/ResultPageNorm.vue'),
      meta: { requiresAuth: true, roles: ['norm_controller'] },
      props: true,
    },
    {
      path: '/process-analysis/norm-controller',
      name: 'process-analysis-norm-controller',
      component: () => import('@/pages/ProcessAnalysisPageNorm.vue'),
      meta: { requiresAuth: true, roles: ['norm_controller'] },
    },
    {
      path: '/statistics-on-comments/norm-controller',
      name: 'statistics-on-comments-norm-controller',
      component: () => import('@/pages/StatisticsOnCommentsPageNorm.vue'),
      meta: { requiresAuth: true, roles: ['norm_controller'] },
    },
    {
      path: '/analysis/author/:name',
      name: 'author-analysis',
      component: () => import('@/pages/AuthorAnalysisPage.vue'),
      meta: { requiresAuth: true, roles: ['norm_controller'] },
      props: true,
    },

    // Админ
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/AdminPanelPage.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },

    // 404 → redirect
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// 🧠 Основная логика защиты маршрутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const userRole = authStore.user?.role

  // ⛔ Пропускаем "внешние" пути (например, /data/)
  if (
    to.path.startsWith('/data/') ||
    to.path.startsWith('/download') ||
    to.path.startsWith('/download_annotated') ||
    to.path.startsWith('/public/') ||
    to.path.startsWith('/static/')
  ) {
    next(false) // Останавливаем навигацию внутри SPA
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 🚪 Уже вошёл, но идёт на /login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const redirectPath =
      userRole === 'norm_controller'
        ? '/history/norm-controller'
        : userRole === 'admin'
          ? '/admin'
          : '/'
    return next(redirectPath)
  }

  if (userRole && accessMap[userRole]) {
    const allowed = accessMap[userRole].some((prefix) => to.path.startsWith(prefix))
    if (!allowed) {
      console.warn(`🚫 Access denied for role: ${userRole} → ${to.path}`)
      const fallback =
        userRole === 'norm_controller'
          ? '/history/norm-controller'
          : userRole === 'admin'
            ? '/admin'
            : '/'
      return next(fallback)
    }
  }

  next()
})

export default router
