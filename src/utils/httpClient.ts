import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { openAiConfig, githubApiConfig } from '../config';

/**
 * Axios instance configured for GitHub API requests.
 *
 * This instance is pre-configured with the base URL,
 *  headers, and a timeout specific to GitHub API.
 * It includes a response interceptor to handle and log errors.
 *
 * @type {AxiosInstance}
 */
const githubClient: AxiosInstance = axios.create({
  baseURL: githubApiConfig.baseUrl,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'github-user-cli'
  },
  timeout: 5000
});

/**
 * Axios instance configured for OpenAI API requests.
 *
 * This instance is pre-configured with the base URL,
 *  authorization headers, and a timeout specific to OpenAI API.
 * It includes a response interceptor to handle and log errors.
 *
 * @type {AxiosInstance}
 */
const openAiClient: AxiosInstance = axios.create({
  baseURL: openAiConfig.apiUrl,
  headers: {
    "Authorization": `Bearer ${openAiConfig.apiKey}`,
    "Content-Type": "application/json"
  },
  timeout: 5000
});

/**
 * Response interceptor for the GitHub client.
 *
 * This interceptor handles and logs HTTP errors,
 *  including response errors, request errors, and setup errors.
 *
 * @param {AxiosResponse<any>} response - The Axios response object.
 * @returns {AxiosResponse<any>} The response object.
 * @throws {Promise<any>} Rejects with the error object if an error occurs.
 */
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

/**
 * Response interceptor for the OpenAI client.
 *
 * This interceptor handles and logs HTTP errors,
 *  including response errors, request errors, and setup errors.
 *
 * @param {AxiosResponse<any>} response - The Axios response object.
 * @returns {AxiosResponse<any>} The response object.
 * @throws {Promise<any>} Rejects with the error object if an error occurs.
 */
openAiClient.interceptors.response.use(
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

export { githubClient, openAiClient };