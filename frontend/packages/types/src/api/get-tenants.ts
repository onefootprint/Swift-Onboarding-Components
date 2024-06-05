import type { Tenant } from '../data/tenant';

export type GetTenantsRequest = {
  search?: string;
  page_size?: string;
};

export type GetTenantsResponse = Tenant[];

export enum TenantSupportedAuthMethod {
  GoogleOauth = 'google_oauth',
  MagicLink = 'magic_link',
}

export enum TenantPreviewApi {
  MatchSignalsList = 'match_signals_list',
  LivenessList = 'liveness_list',
  AuthEventsList = 'auth_events_list',
  DocumentsList = 'documents_list',
  RiskSignalsList = 'risk_signals_list',
  OnboardingSessionToken = 'onboarding_session_token',
  VaultIntegrity = 'vault_integrity',
  ReonboardUser = 'reonboard_user',
  CreateUserDecision = 'create_user_decision',
  CreateUserToken = 'create_user_token',
  CreateBusinessOwner = 'create_business_owner',
  ListBusinessOwners = 'list_business_owners',
  Labels = 'labels',
  Tags = 'tags',
  VaultProxy = 'vault_proxy',
  VaultProxyJit = 'vault_proxy_jit',
  OnboardingsList = 'onboardings_list',
}

export const TENANT_BILLING_PROFILE_PRODUCTS = [
  'monthlyPlatformFee',
  'kyc',
  'oneClickKyc',
  'kycWaterfallSecondVendor',
  'kycWaterfallThirdVendor',
  'idDocs',
  'kyb',
  'curpVerification',
  'pii',
  'hotVaults',
  'hotProxyVaults',
  'vaultsWithNonPci',
  'vaultsWithPci',
  'watchlist',
  'adverseMediaPerUser',
  'continuousMonitoringPerYear',
  'monthlyMinimum',
];

export type TenantBillingProfileProduct =
  (typeof TENANT_BILLING_PROFILE_PRODUCTS)[number];

/**
 * The price of each product for this tenant, set in cents.
 */
export type TenantBillingProfile = Record<
  TenantBillingProfileProduct,
  string | undefined | null
>;

export type TenantVendorControl = {
  idologyEnabled: boolean;
  experianEnabled: boolean;
  lexisEnabled: boolean;
  experianSubscriberCode?: string;
  middeskApiKeyExists: boolean;
};

export type TenantDetail = {
  id: string;
  name: string;
  createdAt: string;

  domains: string[];
  allowDomainAccess: boolean;

  sandboxRestricted: boolean;
  isProdKycPlaybookRestricted: boolean;
  isProdKybPlaybookRestricted: boolean;
  isProdAuthPlaybookRestricted: boolean;

  supportedAuthMethods?: TenantSupportedAuthMethod[];
  allowedPreviewApis: TenantPreviewApi[];
  pinnedApiVersion?: number;
  isDemoTenant: boolean;

  superTenantId?: string;
  workosId?: string;
  stripeCustomerId?: string;
  appClipExperienceId: string;

  billingProfile?: TenantBillingProfile;
  vendorControl?: TenantVendorControl;
};
