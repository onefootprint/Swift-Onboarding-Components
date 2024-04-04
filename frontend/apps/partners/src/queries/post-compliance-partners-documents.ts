import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type CreateComplianceDocRequest = {
  description: string;
  name: string;
  templateId?: string; // template_version_id?: string;
};

type ComplianceDocSummary = {
  activeRequestId?: string;
  activeReviewId?: string;
  activeSubmissionId?: string;
  description: string;
  id: string;
  lastUpdated?: string;
  name: string;
  partnerTenantAssignee?: { firstName?: string; id: string; lastName?: string };
  status:
    | 'not_requested'
    | 'waiting_for_upload'
    | 'waiting_for_review'
    | 'accepted'
    | 'rejected';
  templateId?: string;
  tenantAssignee?: { firstName?: string; id: string; lastName?: string };
};

export type PartnerDocument = ComplianceDocSummary;

/**
 * Posts a document to the compliance partners API.
 *
 * @param {string} authToken - The authentication token for the API.
 * @param {CreateComplianceDocRequest} payload - The payload containing the document information.
 * @param {string} partnershipId - The ID of the partnership.
 * @return {Promise<PartnerDocument[]>} A promise that resolves to an array of partner documents.
 */
const postCompliancePartnersDocuments = async (
  authToken: string,
  payload: CreateComplianceDocRequest,
  partnershipId: string,
) => {
  const { name, description, templateId } = payload;

  return authToken && name && partnershipId
    ? baseFetch<PartnerDocument[]>(
        `/compliance/partners/${partnershipId}/documents`,
        {
          headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
          method: 'POST',
          body: JSON.stringify({
            name,
            ...(description != null && { description }),
            ...(templateId != null && { template_version_id: templateId }),
          }),
        },
      )
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postCompliancePartnersDocuments;
