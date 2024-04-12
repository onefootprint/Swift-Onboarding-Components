import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type OrganizationMember = {
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
    kind: 'api_key' | 'dashboard_user' | 'compliance_partner_dashboard_user';
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
};

/**
 * Asynchronously updates partner members.
 *
 * @param {string} tenantUserId - the ID of the tenant user
 * @param {string} roleId - the ID of the role
 * @return {Promise<OrganizationMember>} a promise that resolves to the updated organization member
 */
const patchPartnerMembers = async (tenantUserId: string, roleId: string) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return tenantUserId && roleId
    ? baseFetch<OrganizationMember>(`/partner/members/${tenantUserId}`, {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'PATCH',
        body: JSON.stringify({ role_id: roleId }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
};

export default patchPartnerMembers;
