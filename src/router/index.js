import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

const DEFAULT_TITLE = 'Worship Helper';
router.beforeEach((to) => {
  document.title = to.meta.title || DEFAULT_TITLE;
});

export default router;
