import axios from 'axios'


const ApiClient = axios.create({

    baseURL: 'http://127.0.0.1:8000/api', // Utilisez http, 127.0.0.1:8000 et 127.0.0.1 ou localhost
    withCredentials: true, // Important pour les cookies et l'authentification

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

export default ApiClient;