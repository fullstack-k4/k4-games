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

export default axiosInstance;
