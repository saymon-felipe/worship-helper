import axios from 'axios'
import { appStore } from '../store/appStore'

const url_api = import.meta.env.VITE_API_URL || "http://localhost:3000";
const authStorageKey = "wh_jwt";

const api = axios.create({
    baseURL: url_api,
    timeout: 15000
});

function isAuthenticationFailure(error) {
    const data = error.response ? error.response.data : null;
    const message = typeof data === "string" ? data : data && data.message;

    return typeof message === "string" && message.toLowerCase().includes("falha na autentica");
}

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
        if (error.response && error.response.status === 401 && isAuthenticationFailure(error)) {
            appStore.clearAuth();
        }

        return Promise.reject(error);
    }
);

export default api;
