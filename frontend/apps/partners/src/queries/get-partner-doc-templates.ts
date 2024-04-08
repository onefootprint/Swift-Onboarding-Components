import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

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

export type DocTemplate = ComplianceDocTemplate;

/**
 * Retrieves compliance document templates using the provided authentication token.
 *
 * @return {Promise<DocTemplate[]>} A promise that resolves with an array of compliance document templates, or rejects with a TypeError if the auth token is missing
 */
const getPartnerDocTemplates = async () => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return baseFetch<DocTemplate[]>('/partner/doc_templates', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });
};

export default getPartnerDocTemplates;
// get-partner-doc-templates
