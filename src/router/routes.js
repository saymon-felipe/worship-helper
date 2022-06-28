import loginPage from "../views/login.vue";
import registerPage from "../views/register.vue";
import homeComponent from "../views/main.vue";

const routes = [
    {
        path: '/login',
        component: loginPage,
        meta: {
            title: "Faça login - Worship Helper"
        }
    },
    {
        path: '/register',
        component: registerPage,
        meta: {
            title: "Registre-se - Worship Helper"
        }
    },
    {
        path: '/home',
        component: homeComponent,
        meta: {
            title: "Início - Worship Helper"
        }
    }
];

export default routes;