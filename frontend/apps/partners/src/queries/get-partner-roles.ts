import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type OffsetPaginatedOrganizationRole = {
  data: Array<{
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
  }>;
  meta: { count: number; nextPage?: number };
};

type Args = {
  kind?: 'api_key' | 'dashboard_user' | 'compliance_partner_dashboard_user';
  page?: number;
  pageSize?: number;
  search?: string;
};

export type Role = OffsetPaginatedOrganizationRole['data'][0];

const getQueryString = (x?: Args): string => {
  if (!x) return '';
  const output = new URLSearchParams();

  if (x.kind) {
    output.append('kind', String(x.kind));
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

const getPartnerRoles = async (args: Args) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  const queryString = getQueryString(args);
  const path = queryString ? `/partner/roles?${queryString}` : '/partner/roles';

  return baseFetch<OffsetPaginatedOrganizationRole>(path, {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'GET',
  });
};

export default getPartnerRoles;
