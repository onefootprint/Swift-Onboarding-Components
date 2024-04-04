import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Creates a new IAM user for the partner tenant. Sends an invite link via WorkOs.
 *
 * @param {string} authToken - the authentication token
 * @param {{}} payload - the payload for the post request
 * @return {Promise<EmptyResponse>} a Promise that resolves with an EmptyResponse on success, or rejects with a TypeError if required parameters are missing
 */
const postPartnerOrgMembers = async (authToken: string, payload: {}) =>
  authToken && payload
    ? baseFetch<EmptyResponse>('/partner/members', {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
        method: 'POST',
        body: JSON.stringify(payload),
      })
    : Promise.reject(new TypeError('Missing required parameters'));

export default postPartnerOrgMembers;
