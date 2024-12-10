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
  CreateBusinessOwner = 'create_business_owner',
  ListBusinessOwners = 'list_business_owners',
  Labels = 'labels',
  Tags = 'tags',
  VaultProxy = 'vault_proxy',
  VaultProxyJit = 'vault_proxy_jit',
  VaultVersioning = 'vault_versioning',
  OnboardingsList = 'onboardings_list',
  DecisionsList = 'decisions_list',
  ImplicitAuth = 'implicit_auth',
  VaultDisasterRecovery = 'vault_disaster_recovery',
  LegacyOnboardingStatusWebhook = 'legacy_onboarding_status_webhook',
  LegacyListUsersBusinesses = 'legacy_list_users_businesses',
  ClientVaultingDocs = 'client_vaulting_docs',
  ListDuplicateUsers = 'list_duplicate_users',
  ManageVerifiedContactInfo = 'manage_verified_contact_info',
  SoftDeleteUsers = 'soft_delete_users',
  PostKycStepupLinks = 'post_kyc_stepup_links',
  SmsLinkAuthentication = 'sms_link_authentication',
}

export enum TenantBillingProfileProduct {
  monthlyPlatformFee = 'monthlyPlatformFee',
  kyc = 'kyc',
  oneClickKyc = 'oneClickKyc',
  kycWaterfallSecondVendor = 'kycWaterfallSecondVendor',
  kycWaterfallThirdVendor = 'kycWaterfallThirdVendor',
  idDocs = 'idDocs',
  kyb = 'kyb',
  kybEinOnly = 'kybEinOnly',
  curpVerification = 'curpVerification',
  pii = 'pii',
  hotVaults = 'hotVaults',
  hotProxyVaults = 'hotProxyVaults',
  vaultsWithNonPci = 'vaultsWithNonPci',
  vaultsWithPci = 'vaultsWithPci',
  watchlistChecks = 'watchlistChecks',
  adverseMediaPerOnboarding = 'adverseMediaPerOnboarding',
  adverseMediaPerYear = 'adverseMediaPerYear',
  continuousMonitoringPerYear = 'continuousMonitoringPerYear',
  monthlyMinimumOnIdentity = 'monthlyMinimumOnIdentity',
  sambaActivityHistory = 'sambaActivityHistory',
  neuroIdBehavioral = 'neuroIdBehavioral',
  sentilinkScore = 'sentilinkScore',
}

/**
 * The price of each product for this tenant, set in cents.
 */
export type TenantBillingProfile = {
  prices: TenantBillingProfilePrices;
  billingEmail?: string;
  omitBilling: boolean;
  sendAutomatically: boolean;
};

export type TenantBillingProfilePrices = Partial<Record<TenantBillingProfileProduct, string | null>>;

export type TenantVendorControl = {
  idologyEnabled: boolean;
  experianEnabled: boolean;
  lexisEnabled: boolean;
  experianSubscriberCode?: string;
  middeskApiKeyExists: boolean;
  sentilinkCredentialsExists: boolean;
  neuroEnabled: boolean;
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
