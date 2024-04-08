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
 * Returns basic info about the authed partner tenant
 *
 * @return {Promise<PartnerOrganization>} Partner organization information
 */
const getPartner = async () => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return baseFetch<PartnerOrganization>('/partner', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });
};

export default getPartner;
