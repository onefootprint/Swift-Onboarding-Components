import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

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
 * Return the list of partner tenants that can be inherited by the authed user
 *
 * @return {Promise<PartnerOrganization[]>} A promise that resolves to an array of PartnerOrganization objects representing the roles.
 */
const getPartnerAuthRoles = async (token: string) =>
  baseFetch<PartnerOrganization[]>('/partner/auth/roles', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });

export default getPartnerAuthRoles;
