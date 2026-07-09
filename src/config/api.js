import axios from 'axios'

const url_api = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: url_api
});

export default api;
