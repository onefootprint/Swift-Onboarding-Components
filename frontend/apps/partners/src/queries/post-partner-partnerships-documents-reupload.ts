import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type ReuploadComplianceDocRequest = { description: string; name: string };
type EmptyResponse = Record<string, never>;

/**
 * Request reupload of a document.
 *
 * @param {string} partnershipId - The ID of the partnership.
 * @param {string} documentId - The ID of the document to be re-uploaded.
 * @param {ReuploadComplianceDocRequest} payload - The payload containing the name and description of the document.
 * @return {Promise<EmptyResponse>} A promise that resolves with an empty response if successful, or rejects with a TypeError if required parameters are missing.
 */
const postPartnerPartnershipsDocumentsReupload = async (
  partnershipId: string,
  documentId: string,
  payload: ReuploadComplianceDocRequest,
) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const { name, description } = payload;
  return partnershipId && documentId && name
    ? baseFetch<EmptyResponse>(`/partner/partnerships/${partnershipId}/documents/${documentId}/reupload`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify({
          name,
          ...(description != null && { description }),
        }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerPartnershipsDocumentsReupload;
