import { createWebHashHistory, createRouter } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: require('@/components/WindowMain.vue').default
    },
    {
      path: '/set',
      name: 'Settings',
      component: require('@/components/WindowSettings.vue').default
    }
  ]
});
export default router;
