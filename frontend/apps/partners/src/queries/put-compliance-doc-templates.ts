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
 * Updates a compliance document template.
 *
 * @param {string} authToken - the authentication token
 * @param {CreateComplianceDocTemplateRequest} payload - the payload for creating a compliance document template
 * @param {string} templateId - the ID of the compliance document template to update
 * @return {Promise<ComplianceDocTemplate>} a promise that resolves to the updated compliance document template
 */
const putComplianceDocTemplates = async (
  authToken: string,
  payload: CreateComplianceDocTemplateRequest,
  templateId: string,
) =>
  authToken && payload && templateId
    ? baseFetch<ComplianceDocTemplate>(`/partner/doc_templates/${templateId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    : Promise.reject(new TypeError('Missing required parameters'));

export default putComplianceDocTemplates;
