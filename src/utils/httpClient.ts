import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { githubApiConfig } from '../config';

// Create an Axios instance for the GitHub client
const githubClient: AxiosInstance = axios.create({
  baseURL: githubApiConfig.baseUrl,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'github-user-cli'
  },
  timeout: 5000
});

// Response interceptor for handling responses and errors
githubClient.interceptors.response.use(
  (response: AxiosResponse<any>) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(
        `HTTP Error: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      // No response received
      console.error('No response received:', error.request);
    } else {
      // Error setting up the request
      console.error('Error in request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

export { githubClient };