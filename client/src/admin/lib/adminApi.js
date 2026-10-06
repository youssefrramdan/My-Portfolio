import { createApi } from '@/lib/axios';

const adminApi = createApi();

// 401s from these are expected (checking the session, wrong credentials) and must not trigger a redirect.
const AUTH_CHECK_URLS = ['/auth/me', '/auth/login'];

let onUnauthorized = null;

/** Registers what happens when the session expires mid-use (AdminApp sends the user back to the login page). */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

adminApi.interceptors.response.use(undefined, (error) => {
  if (error.status === 401 && !AUTH_CHECK_URLS.includes(error.url)) onUnauthorized?.();
  return Promise.reject(error);
});

export default adminApi;
