import axios from 'axios'
import { appStore } from '../store/appStore'

const url_api = import.meta.env.VITE_API_URL || "http://localhost:3000";
const authStorageKey = "wh_jwt";

const api = axios.create({
    baseURL: url_api,
    timeout: 15000
});

api.interceptors.request.use((config) => {
    const token = appStore.state.auth.token || localStorage.getItem(authStorageKey);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            appStore.clearAuth();
        }

        return Promise.reject(error);
    }
);

export default api;
