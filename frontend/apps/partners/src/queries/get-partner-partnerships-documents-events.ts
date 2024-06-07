import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type ComplianceDocEvent = {
  timestamp: string;
  actor: {
    user: { id: string; firstName: string; lastName: string };
    org: string;
  } | null;
  event: {
    kind: string;
    data: { templateId: null; name: string; description: string };
  };
};

/**
 * Retrieves compliance documents events for a specific partnership and document.
 *
 * @param {string} partnershipId - The ID of the partnership.
 * @param {string} documentId - The ID of the document.
 * @return {Promise<ComplianceDocEvent[]>} A Promise that resolves to an array of ComplianceDocEvent objects.
 */
const getPartnerPartnershipsDocumentsEvents = async (partnershipId: string, documentId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return partnershipId && documentId
    ? baseFetch<ComplianceDocEvent[]>(`/partner/partnerships/${partnershipId}/documents/${documentId}/events`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'GET',
        cache: 'no-store',
      })
    : Promise.reject(new TypeError('Missing auth token parameter'));
};

export default getPartnerPartnershipsDocumentsEvents;
