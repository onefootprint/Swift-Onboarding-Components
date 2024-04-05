import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Deletes compliance partner requests.
 *
 * @param {string} authToken - the authentication token
 * @param {string} partnershipId - the partnership ID
 * @param {string} requestId - the request ID
 * @return {Promise<EmptyResponse>} a promise that resolves to an empty response or rejects with a TypeError
 */
const deleteCompliancePartnersRequests = async (
  authToken: string,
  partnershipId: string,
  requestId: string,
) =>
  authToken && partnershipId && requestId
    ? baseFetch<EmptyResponse>(
        `/partner/partnerships/${partnershipId}/requests/${requestId}`,
        {
          headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
          method: 'DELETE',
        },
      )
    : Promise.reject(new TypeError('Missing required parameters'));

export default deleteCompliancePartnersRequests;
