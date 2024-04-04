import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Deletes compliance document templates.
 *
 * @param {string} authToken - the authentication token
 * @param {string} templateId - the ID of the template to delete
 * @return {Promise<EmptyResponse>} a Promise that resolves with an empty response
 */
const deleteComplianceDocTemplates = async (
  authToken: string,
  templateId: string,
) =>
  authToken && templateId
    ? baseFetch<EmptyResponse>(`/compliance/doc_templates/${templateId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
        method: 'DELETE',
      })
    : Promise.reject(new TypeError('Missing required parameters'));

export default deleteComplianceDocTemplates;
