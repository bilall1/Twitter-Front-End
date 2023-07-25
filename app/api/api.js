import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Replace with your Go backend's URL
});

export default apiClient;
