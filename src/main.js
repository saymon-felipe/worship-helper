import { createApp, VueElement } from 'vue';
import App from './App.vue';
import router from './router';
import $ from 'jquery';

const app = createApp(App);

app.use(router);

app.mount('#app');
