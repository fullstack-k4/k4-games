import axios from "axios";
import { BASE_URL } from "../constant.js";

const API_KEY = import.meta.env.VITE_API_KEY;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "x-api-key": API_KEY,
    },
});




axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if error response status is 401 (Unauthorized)
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data?.error === "jwt expired" &&
            window.location.pathname !== "/login"
        ) {
            // Clear local storage/session if any auth info stored
            sessionStorage.removeItem("isAuthenticated");

            // Redirect to login page
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
