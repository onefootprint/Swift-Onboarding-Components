import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type CreateReviewRequest = {
  decision: 'accepted' | 'rejected';
  note: string;
  submissionId: string;
};
type EmptyResponse = Record<string, never>;

/**
 * * Submit a review for a compliance document submissions
 *
 * @param {string} partnershipId - The ID of the partnership.
 * @param {string} documentId - The ID of the document.
 * @param {CreateReviewRequest} payload - The request payload containing decision, note, and submission ID.
 * @return {Promise<EmptyResponse>} A promise that resolves to an empty response if successful, otherwise rejects with an error.
 */
const postPartnerPartnershipsDocumentsReviews = async (
  partnershipId: string,
  documentId: string,
  payload: CreateReviewRequest,
) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const { decision, note, submissionId } = payload;
  return partnershipId && documentId && decision
    ? baseFetch<EmptyResponse>(`/partner/partnerships/${partnershipId}/documents/${documentId}/reviews`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify({
          decision,
          ...(note != null && { note }),
          ...(submissionId != null && { submission_id: submissionId }),
        }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerPartnershipsDocumentsReviews;
