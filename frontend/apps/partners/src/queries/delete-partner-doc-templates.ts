import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Deactivates a compliance document template.
 *
 * @param {string} templateId - the ID of the template to delete
 * @return {Promise<EmptyResponse>} a Promise that resolves with an empty response
 */
const deletePartnerDocTemplates = async (templateId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return templateId
    ? baseFetch<EmptyResponse>(`/partner/doc_templates/${templateId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'DELETE',
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default deletePartnerDocTemplates;
