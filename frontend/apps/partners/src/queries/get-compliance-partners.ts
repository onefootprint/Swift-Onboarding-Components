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
 * @param {string} authToken - The authentication token used to authorize the request.
 * @return {Promise<PartnerCompany[]>} A promise that resolves to an array of PartnerCompany objects representing the compliance partners.
 * @throws {TypeError} If the authToken parameter is missing.
 */
const getCompliancePartners = async (authToken: string) =>
  authToken
    ? baseFetch<PartnerCompany[]>('/compliance/partners', {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: authToken },
        method: 'GET',
      })
    : Promise.reject(new TypeError('Missing auth token parameter'));

export default getCompliancePartners;
