import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type ComplianceCompanySummary = {
  companyName: string;
  id: string;
  numActivePlaybooks: number;
  numControlsComplete: number;
  numControlsTotal: number;
};

export type PartnerCompany = ComplianceCompanySummary;

/**
 * Returns a summary of partnered companies for a compliance partner.
 *
 * @return {Promise<PartnerCompany[]>} A promise that resolves to an array of PartnerCompany objects representing the compliance partners.
 * @throws {TypeError} If the authToken parameter is missing.
 */
const getPartnerPartnerships = async () => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return baseFetch<PartnerCompany[]>('/partner/partnerships', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });
};

export default getPartnerPartnerships;
