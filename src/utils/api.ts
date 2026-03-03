export const getApiBase = (): string => {
    // In production (Azure/Monolith), we use relative paths.
    // In development, we fallback to the local server (3000).
    if (import.meta.env.PROD) {
        return '';
    }
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};
