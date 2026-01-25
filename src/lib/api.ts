import axios from "axios";

// Create axios instance with base URL from environment
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g. redirect to login)
        if (error.response?.status === 401) {
            // Potentially clear auth state here
            console.warn("Unauthorized access");
        }
        return Promise.reject(error);
    }
);
