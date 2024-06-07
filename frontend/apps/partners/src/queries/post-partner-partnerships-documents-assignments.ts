import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Asynchronously assigns or unassigns a document to a partnership for compliance purposes.
 *
 * @param {string} partnershipId - The ID of the partnership.
 * @param {string} documentId - The ID of the document.
 * @param {string} [userId] - The ID of the user to assign the document to. Pass none/null to unassign.
 * @return {Promise<EmptyResponse>} A Promise that resolves with an empty response upon successful assignment, or rejects with a TypeError if required parameters are missing.
 */
const postPartnerPartnershipsDocumentsAssignments = async (
  partnershipId: string,
  documentId: string,
  userId?: string /** Pass none/null to unassign. */,
) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return partnershipId && documentId
    ? baseFetch<EmptyResponse>(`/partner/partnerships/${partnershipId}/documents/${documentId}/assignments`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify({
          ...(userId != null && { user_id: userId }),
        }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerPartnershipsDocumentsAssignments;
