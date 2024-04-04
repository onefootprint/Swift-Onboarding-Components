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
 * @param {string} authToken - The authentication token for the request
 * @return {Promise<DocTemplate[]>} A promise that resolves with an array of compliance document templates, or rejects with a TypeError if the auth token is missing
 */
const getComplianceDocTemplates = async (authToken: string) =>
  authToken
    ? baseFetch<DocTemplate[]>('/compliance/doc_templates', {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
        method: 'GET',
      })
    : Promise.reject(new TypeError('Missing auth token parameter'));

export default getComplianceDocTemplates;
