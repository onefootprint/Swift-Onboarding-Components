import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type CreateComplianceDocTemplateRequest = {
  description: string;
  name: string;
};

type ComplianceDocTemplate = {
  id: string;
  latestVersion: {
    createdAt: string;
    createdByPartnerTenantUser: {
      firstName?: string;
      id: string;
      lastName?: string;
    };
    description: string;
    id: string;
    name: string;
    templateId: string;
  };
};

/**
 * Sends a POST request to create a new compliance document template.
 *
 * @param {CreateComplianceDocTemplateRequest} payload - The payload containing the data for the new template.
 * @return {Promise<ComplianceDocTemplate>} A promise that resolves to the created template if successful, or rejects with an error if the required parameters are missing.
 */
const postPartnerDocTemplates = async (payload: CreateComplianceDocTemplateRequest) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return payload
    ? baseFetch<ComplianceDocTemplate>('/partner/doc_templates', {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify(payload),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default postPartnerDocTemplates;
