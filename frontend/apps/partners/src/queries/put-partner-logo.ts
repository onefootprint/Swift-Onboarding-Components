import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type PartnerOrganization = {
  allowDomainAccess: boolean;
  domains: Array<string>;
  id: string;
  isDomainAlreadyClaimed?: boolean;
  logoUrl?: string;
  name: string;
  websiteUrl?: string;
};

/**
 * Upload a new logo for the partner organization.
 *
 * @return {Promise<PartnerOrganization>} Partner organization information
 */
const putPartnerLogo = async (formData: FormData) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return baseFetch<PartnerOrganization>('/partner/logo', {
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: token,
      'content-type': 'multipart/form-data',
    },
    method: 'PUT',
    body: formData,
  });
};

export default putPartnerLogo;
