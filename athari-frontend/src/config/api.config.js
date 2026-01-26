const API_CONFIG = {
  // URL de base du backend Laravel
  BACKEND_URL: 'http://127.0.0.1:8000',
  
  // URL pour les images (utilisée dans les tags <img src="...">)
  get IMAGE_BASE_URL() {
    // En développement, utilisation directement l'URL du backend
    // car le proxy Vite ne fonctionne pas pour les balises <img>
    if (import.meta.env.DEV) {
      return this.BACKEND_URL;
    }
    // En production, utilisez des URLs relatives
    return '';
  },
  
  // URL pour les API (utilisée avec axios/fetch)
  get API_BASE_URL() {
    return this.BACKEND_URL;
  },
  
  // Fonction utilitaire pour créer des URLs d'images
  imageUrl(path) {
    if (!path) return null;
    
    // Si le chemin commence déjà par http, le retourner tel quel
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Si le chemin est relatif, ajouter la base URL
    if (path.startsWith('/')) {
      return `${this.IMAGE_BASE_URL}${path}`;
    }
    
    // Sinon, assumer que c'est un chemin de stockage Laravel
    return `${this.IMAGE_BASE_URL}/storage/${path}`;
  },
  
  // Fonction pour les PDFs
  pdfUrl(path) {
    return this.imageUrl(path);
  }
};

export default API_CONFIG;