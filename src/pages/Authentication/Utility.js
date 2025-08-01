import axios from "axios";

export const url = "http://10.226.43.156:8500";
const token = localStorage.getItem("Token");

export const axiosInstance = axios.create({
    baseURL: url,
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
    withCredentials: true,
});