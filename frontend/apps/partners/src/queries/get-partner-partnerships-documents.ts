import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type ComplianceDocSummary = {
  activeRequestId?: string;
  activeReviewId?: string;
  activeSubmissionId?: string;
  description: string;
  id: string;
  lastUpdated?: string;
  name: string;
  partnerTenantAssignee?: { firstName?: string; id: string; lastName?: string };
  status: 'not_requested' | 'waiting_for_upload' | 'waiting_for_review' | 'accepted' | 'rejected';
  templateId?: string;
  tenantAssignee?: { firstName?: string; id: string; lastName?: string };
};

export type PartnerDocument = ComplianceDocSummary;

/**
 * Fetches compliance documents for a specific partnership using the provided authentication token.
 *
 * @param {string} partnershipId - The ID of the partnership for which to fetch documents
 * @return {Promise<PartnerDocument[]>} A promise that resolves with an array of partner documents or rejects with a TypeError
 */
const getPartnerPartnershipsDocuments = async (partnershipId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return partnershipId
    ? baseFetch<PartnerDocument[]>(`/partner/partnerships/${partnershipId}/documents`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'GET',
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default getPartnerPartnershipsDocuments;
