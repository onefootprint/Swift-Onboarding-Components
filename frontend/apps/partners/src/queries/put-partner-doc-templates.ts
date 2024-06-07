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
 * Updates a compliance document template by creating a new template version.
 *
 * @param {CreateComplianceDocTemplateRequest} payload - the payload for creating a compliance document template
 * @param {string} templateId - the ID of the compliance document template to update
 * @return {Promise<ComplianceDocTemplate>} a promise that resolves to the updated compliance document template
 */
const putPartnerDocTemplates = async (payload: CreateComplianceDocTemplateRequest, templateId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return payload && templateId
    ? baseFetch<ComplianceDocTemplate>(`/partner/doc_templates/${templateId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default putPartnerDocTemplates;
