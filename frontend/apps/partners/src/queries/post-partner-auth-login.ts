import baseFetch from './base-fetch';

type OrgLoginRequest = {
  code: string;
  request_org_id?: string;
};
export type OrgLoginResponse = {
  authToken: string;
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
  partnerTenant?: {
    id: string;
    name: string;
    domains: Array<string>;
    allowDomainAccess: boolean;
    isDomainAlreadyClaimed?: boolean;
    isAuthMethodSupported?: boolean;
    logoUrl?: string;
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
        | 'compliance_partner_read'
        | 'compliance_partner_admin'
        | 'compliance_partner_manage_templates'
        | 'compliance_partner_manage_reviews'
        | 'manage_compliance_doc_submission'
        | 'write_lists'
      >;
    };
    rolebinding?: { lastLoginAt?: string };
  };
};

/**
 * Sends a POST request to the '/partner/auth/login' endpoint with the provided payload.
 *
 * @param {OrgLoginRequest} payload - The payload containing the login information.
 * @return {Promise<OrgLoginResponse>} - A promise that resolves to the response from the server.
 */
const postPartnerAuthLogin = async (payload: OrgLoginRequest) =>
  baseFetch<OrgLoginResponse>('/partner/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    next: { revalidate: 30 },
  });

export default postPartnerAuthLogin;
