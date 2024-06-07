import { getAuthCookie } from '@/app/actions';
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
  status: 'not_requested' | 'waiting_for_upload' | 'waiting_for_review' | 'accepted' | 'rejected';
  templateId?: string;
  tenantAssignee?: { firstName?: string; id: string; lastName?: string };
};

export type PartnerDocument = ComplianceDocSummary;

/**
 * Posts compliance partner documents.
 *
 * @param {string} partnershipId - ID of the partnership
 * @param {CreateComplianceDocRequest} payload - request payload containing name, description, and template ID
 * @return {Promise<PartnerDocument[]>} Promise that resolves with an array of PartnerDocument objects or rejects with a TypeError
 */
const postPartnerPartnershipsDocuments = async (partnershipId: string, payload: CreateComplianceDocRequest) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const { name, description, templateId } = payload;
  return name && partnershipId
    ? baseFetch<PartnerDocument[]>(`/partner/partnerships/${partnershipId}/documents`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify({
          name,
          ...(description != null && { description }),
          ...(templateId != null && { template_version_id: templateId }),
        }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerPartnershipsDocuments;
