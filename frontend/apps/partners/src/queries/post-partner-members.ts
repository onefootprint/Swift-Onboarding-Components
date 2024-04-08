import { getAuthCookie } from '@/app/actions';
import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

export type CreateTenantUserRequest = {
  email: string;
  firstName?: string;
  lastName?: string;
  /** A feature only used by employees to allow inviting users to a tenant without sending them an email */
  omitEmailInvite: boolean;
  redirectUrl: string;
  roleId: string;
};

export type OrganizationMember = {
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
 * Create a new IAM user for the partner tenant. Sends an invite link via WorkOs
 *
 * @param {CreateTenantUserRequest} payload - the payload containing information about the tenant user to be created
 * @return {Promise<OrganizationMember>} a Promise that resolves to the created organization member
 */
const postPartnerMembers = async ({
  email,
  firstName,
  lastName,
  omitEmailInvite,
  redirectUrl,
  roleId,
}: CreateTenantUserRequest) => {
  const token = await getAuthCookie();
  if (!token) return Promise.reject(new TypeError('Missing auth token'));

  return baseFetch<OrganizationMember>('/partner/members', {
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
    method: 'POST',
    body: JSON.stringify({
      ...(email != null && { email }),
      ...(firstName != null && { first_name: firstName }),
      ...(lastName != null && { last_name: lastName }),
      ...(omitEmailInvite != null && { omit_email_invite: omitEmailInvite }),
      ...(redirectUrl != null && { redirect_url: redirectUrl }),
      ...(roleId != null && { role_id: roleId }),
    }),
  });
};

export default postPartnerMembers;
