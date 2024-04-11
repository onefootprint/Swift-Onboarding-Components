import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type UpdatePartnerTenantRequest = {
  allowDomainAccess?: boolean;
  name?: string;
  websiteUrl?: string;
};

type PartnerOrganization = {
  allowDomainAccess: boolean;
  domains: Array<string>;
  id: string;
  isAuthMethodSupported?: boolean;
  isDomainAlreadyClaimed?: boolean;
  logoUrl?: string;
  name: string;
  websiteUrl?: string;
};

/**
 * Updates the basic information for the tenant
 *
 * @param {UpdatePartnerTenantRequest} payload - The payload containing information to update the partner organization.
 * @return {Promise<PartnerOrganization>} A Promise that resolves with the updated partner organization.
 */
const patchPartner = async (payload: UpdatePartnerTenantRequest) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const { allowDomainAccess, name, websiteUrl } = payload;

  return baseFetch<PartnerOrganization>('/partner', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'PATCH',
    body: JSON.stringify({
      ...(name != null && { name }),
      ...(websiteUrl != null && { website_url: websiteUrl }),
      ...(allowDomainAccess != null && {
        allow_domain_access: allowDomainAccess,
      }),
    }),
  });
};

export default patchPartner;
