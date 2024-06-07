import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Retracts a document request.
 *
 * @param {string} partnershipId - the partnership ID
 * @param {string} requestId - the request ID
 * @return {Promise<EmptyResponse>} a promise that resolves to an empty response or rejects with a TypeError
 */
const deletePartnerPartnershipsRequests = async (partnershipId: string, requestId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return partnershipId && requestId
    ? baseFetch<EmptyResponse>(`/partner/partnerships/${partnershipId}/requests/${requestId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'DELETE',
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default deletePartnerPartnershipsRequests;
