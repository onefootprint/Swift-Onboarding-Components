import { DASHBOARD_AUTHORIZATION_HEADER } from '@/config/constants';

import baseFetch from './base-fetch';

type AssumePartnerRoleResponse = {
  token: string;
  partnerTenant: {
    allowDomainAccess: boolean;
    domains: Array<string>;
    id: string;
    isAuthMethodSupported?: boolean;
    isDomainAlreadyClaimed?: boolean;
    logoUrl?: string;
    name: string;
    websiteUrl?: string;
  };
  user: {
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
  };
};

/**
 * After the user has proven they own an email address, allow them to assume an
 * auth role for any partner tenant to which the email address has access.
 *
 * @param {string} token - The authentication token.
 * @param {string} partnerTenantId - The partner tenant ID.
 * @return {Promise<AssumePartnerRoleResponse>} A promise that resolves with the response after posting the authentication.
 */
const postPartnerAuthAssumeRole = async (
  token: string,
  partnerTenantId: string,
) =>
  token && partnerTenantId
    ? baseFetch<AssumePartnerRoleResponse>('/partner/auth/assume_role', {
        headers: { [DASHBOARD_AUTHORIZATION_HEADER]: token },
        method: 'POST',
        body: JSON.stringify({ partner_tenant_id: partnerTenantId }),
      })
    : Promise.reject(new TypeError('Missing required parameters'));
export default postPartnerAuthAssumeRole;
