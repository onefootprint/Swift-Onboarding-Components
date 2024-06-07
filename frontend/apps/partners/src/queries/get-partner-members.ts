import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type GetComplianceMembersArgs = {
  isInvitePending?: boolean;
  roleIds?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};
type OffsetPaginatedOrganizationMember = {
  data: Array<{
    createdAt: string;
    email: string;
    firstName?: string;
    id: string;
    isFirmEmployee: boolean;
    lastName?: string;
    role: {
      createdAt: string;
      id: string;
      isImmutable: boolean;
      kind: 'ApiKey' | 'DashboardUser' | 'CompliancePartnerDashboardUser';
      name: string;
      numActiveApiKeys?: number;
      numActiveUsers?: number;
      scopes: Array<
        | 'read'
        | 'admin'
        | 'api_keys'
        | 'manage_vault_proxy'
        | 'manage_webhooks'
        | 'manual_review'
        | 'onboarding_configuration'
        | 'write_lists'
        | 'org_settings'
        | 'cip_integration'
        | 'trigger_kyb'
        | 'trigger_kyc'
        | 'auth_token'
        | 'onboarding'
        | 'decrypt_custom'
        | 'decrypt_document'
        | 'decrypt_document_and_selfie'
        | 'decrypt_all'
        | 'write_entities'
        | 'label_and_tag'
        | 'manage_compliance_doc_submission'
        | 'compliance_partner_read'
        | 'compliance_partner_admin'
        | 'compliance_partner_manage_templates'
        | 'compliance_partner_manage_reviews'
      >;
    };
    rolebinding?: { lastLoginAt?: string };
  }>;
  meta: { count: number; nextPage?: number };
};

export type OrganizationMember = OffsetPaginatedOrganizationMember['data'][0];

const getQueryString = (x?: GetComplianceMembersArgs): string => {
  if (!x) return '';
  const output = new URLSearchParams();

  if (typeof x.isInvitePending === 'boolean') {
    output.append('is_invite_pending', String(x.isInvitePending));
  }
  if (x.roleIds && x.roleIds.length > 0) {
    output.append('role_ids', String(x.roleIds));
  }
  if (x.search) {
    output.append('search', String(x.search));
  }
  if (x.page) {
    output.append('page', String(x.page));
  }
  if (x.pageSize) {
    output.append('page_size', String(x.pageSize));
  }

  return output.toString();
};

/**
 * Returns a list of dashboard members for the partner tenant.
 *
 * @param {GetComplianceMembersArgs} args - Optional arguments for retrieving compliance members.
 * @return {Promise<OffsetPaginatedOrganizationMember>} A promise that resolves with the organization members.
 */
const getPartnerMembers = async (args?: GetComplianceMembersArgs) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const queryString = getQueryString(args);
  const path = queryString ? `/partner/members?${queryString}` : '/partner/members';

  return baseFetch<OffsetPaginatedOrganizationMember>(path, {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });
};

export default getPartnerMembers;
