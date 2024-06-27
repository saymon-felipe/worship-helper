import loginPage from "../views/login.vue";
import registerPage from "../views/register.vue";
import homeComponent from "../views/main.vue";
import chooseChurch from "../components/chooseChurch.vue";
import registerChurch from "../components/registerChurch.vue";
import church from "../components/church.vue";
import eventComponent from "../components/event.vue";
import editProfile from "../components/editProfile.vue";
import manageChurch from "../components/manageChurch.vue";
import members from "../components/members.vue";
import configChurch from "../components/configChurch.vue";
import churchEvents from "../components/churchEvents.vue";
import churchMusics from "../components/churchMusics.vue";
import musicLibrary from "../components/musicLibrary.vue";

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
        },
        children: [
            {
                path: '',
                component: chooseChurch
            },
            {
                path: '/register-church',
                component: registerChurch,
                meta: {
                    title: "Cadastro de igreja - Worship Helper"
                }
            },
            {
                path: 'church/:id_igreja',
                component: church,
                meta: {
                    title: "Visualizar igreja - Worship Helper"
                }
            },
            {
                path: 'manage-church/:id_igreja',
                component: manageChurch,
                meta: {
                    title: "Gerenciar igreja - Worship helper"
                }
            },
            {
                path: 'manage-church/:id_igreja/members',
                component: members,
                meta: {
                    title: "Gerenciar membros - Worship Helper"
                }
            },
            {
                path: 'manage-church/:id_igreja/config',
                component: configChurch,
                meta: {
                    title: "Configurar igreja - Worship Helper"
                }
            },
            {
                path: 'manage-church/:id_igreja/events',
                component: churchEvents,
                meta: {
                    title: "Eventos - Worship Helper"
                }
            },
            {
                path: "music-library",
                component: musicLibrary,
                meta: {
                    title: "Biblioteca de músicas - Worship Helper"
                }
            },
            {
                path: 'manage-church/:id_igreja/musics',
                component: churchMusics,
                meta: {
                    title: "Músicas - Worship Helper"
                }
            },
            {
                path: 'event/:id_evento',
                component: eventComponent,
                meta: {
                    title: "Editar evento - Worship Helper"
                }
            },
            {
                path: 'manage-profile',
                component: editProfile,
                meta: {
                    title: "Gerenciar perfil - Worship Helper"
                }
            }
        ]
    },
    {
        path: "/:catchAll(.*)",
        redirect: '/login'
    }
];

export default routes;