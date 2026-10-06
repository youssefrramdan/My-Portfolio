import axios from 'axios';

/** Axios instance that unwraps the server's `{ success, data, message }` envelope and normalizes errors. */
export function createApi() {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '/api',
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const payload = error.response?.data;
      const normalized = new Error(payload?.message ?? error.message);
      normalized.status = error.response?.status;
      normalized.data = payload?.data ?? null;
      normalized.url = error.config?.url;
      return Promise.reject(normalized);
    },
  );

  return instance;
}

const api = createApi();

export default api;
