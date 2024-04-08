import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Deactivates a partner member by their tenant user ID.
 *
 * @param {string} tenantUserId - The ID of the tenant user to deactivate.
 * @return {Promise<EmptyResponse>} A promise that resolves with an empty response if successful, or rejects with a TypeError if there are missing parameters or authentication token.
 */
const postPartnerMembersDeactivate = async (tenantUserId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return tenantUserId
    ? baseFetch<EmptyResponse>(`/partner/members/${tenantUserId}/deactivate`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerMembersDeactivate;
