// src/api/ApiClient.jsx ou où vous l'avez placé

import axios from 'axios'
// L'import de React n'est pas nécessaire ici

const ApiClient = axios.create({
// *** CORRECTION DE L'URL ***
    baseURL: 'http://127.0.0.1:8000/api', // Utilisez http, et 127.0.0.1 ou localhost
    withCredentials: true, // Important pour les cookies et l'authentification
    //headers par defaut
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

//intercepteur de requete pour ajouter le token d'authentification
ApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Intercepteur de réponse pour gérer les erreurs 401 (token expiré)
ApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expiré, essayer de rafraîchir
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const refreshResponse = await ApiClient.post('/auth/refresh', { refreshToken });
                    const newToken = refreshResponse.data.token;
                    const newUser = refreshResponse.data.user;
                    localStorage.setItem('authToken', newToken);
                    localStorage.setItem('authUser', JSON.stringify(newUser));
                    // Retry the original request with new token
                    error.config.headers['Authorization'] = `Bearer ${newToken}`;
                    return ApiClient(error.config);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)

export default ApiClient; // Exportation correcte