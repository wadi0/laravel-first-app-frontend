import axios from 'axios';

// ✅ Create Axios instance
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',//'https://e-commerce-api-create.onrender.com/api/',
    // 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ✅ Request Interceptor (যদি টোকেন লাগে)
apiClient.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Generic API Functions
const AxiosServices = {
    get: (url, params = {}) => apiClient.get(url, {params}),
    post: (url, data = {}, third = {}) => {
        let config = {};
        if (third === true) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }
        return apiClient.post(url, data, config);
    },
    put: (url, data = {}) => apiClient.put(url, data),
    patch: (url, data = {}) => apiClient.patch(url, data),
    delete: (url) => apiClient.delete(url),
};

export default AxiosServices;
