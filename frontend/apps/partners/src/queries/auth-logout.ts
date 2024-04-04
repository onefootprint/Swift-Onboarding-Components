import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Async function for logging out the user authentication.
 *
 * @param {string} auth - The authentication token.
 * @return {Promise<EmptyResponse>} Promise that resolves to an empty response.
 */
const authLogout = async (auth: string) =>
  baseFetch<EmptyResponse>('/org/auth/logout', {
    cache: 'no-cache',
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth },
    method: 'POST',
  });

export default authLogout;
