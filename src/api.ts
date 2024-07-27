import axios from 'axios';

// Create an instance of Axios with custom configuration
const api = axios.create({
    baseURL: 'https://kharkiv.energy-ua.info/grafik', // Replace with your API's base URL
    headers: {
    },
    withCredentials: true, // This is used if you need to send cookies with requests
});

export default api;
