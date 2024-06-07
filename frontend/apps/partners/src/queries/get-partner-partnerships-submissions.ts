import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type ComplianceDocSubmission = {
  id: string;
  createdAt: string;
  data:
    | { kind: 'external_url'; data: { url: string } }
    | { kind: 'file_upload'; data: { filename: string; data: string } };
};

/**
 * Fetches the submission with the given ID
 *
 * @param {string} partnershipId - The ID of the partnership.
 * @param {string} submissionId - The ID of the submission.
 * @return {Promise<ComplianceDocSubmission[]>} A promise that resolves to an array of compliance document submissions.
 */
const getPartnerPartnershipsSubmissions = async (partnershipId: string, submissionId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return partnershipId && submissionId
    ? baseFetch<ComplianceDocSubmission>(`/partner/partnerships/${partnershipId}/submissions/${submissionId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'GET',
      })
    : Promise.reject(new TypeError('Missing auth token parameter'));
};

export default getPartnerPartnershipsSubmissions;
