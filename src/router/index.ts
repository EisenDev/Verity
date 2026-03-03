import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../views/Landing.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Operations from '../views/Operations.vue';
import Analytics from '../views/Analytics.vue';
import Settings from '../views/Settings.vue';
import UserManagement from '../views/UserManagement.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: Landing
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/operations',
            name: 'operations',
            component: Operations,
            meta: { requiresAuth: true }
        },
        {
            path: '/analytics',
            name: 'analytics',
            component: Analytics,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/users',
            name: 'users',
            component: UserManagement,
            meta: { requiresAuth: true, requiresAdmin: true }
        }
    ]
});

// Basic auth guard (checking a cookie naively for demonstration)
router.beforeEach((to, from, next) => {
    const isAuth = document.cookie.includes('auth_token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (to.meta.requiresAuth && !isAuth) {
        next({ name: 'login' });
    } else if (to.name === 'login' && isAuth) {
        next({ name: 'dashboard' });
    } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
        alert('PERMISSION DENIED: Administrative Clearance Required.');
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;
