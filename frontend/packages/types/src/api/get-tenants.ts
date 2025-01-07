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
  monthlyPlatformFee = 'monthly_platform_fee',
  kyc = 'kyc',
  oneClickKyc = 'one_click_kyc',
  kycWaterfallSecondVendor = 'kyc_waterfall_second_vendor',
  kycWaterfallThirdVendor = 'kyc_waterfall_third_vendor',
  idDocs = 'id_docs',
  kyb = 'kyb',
  kybEinOnly = 'kyb_ein_only',
  curpVerification = 'curp_verification',
  pii = 'pii',
  hotVaults = 'hot_vaults',
  hotProxyVaults = 'hot_proxy_vaults',
  vaultsWithNonPci = 'vaults_with_non_pci',
  vaultsWithPci = 'vaults_with_pci',
  watchlistChecks = 'watchlist_checks',
  adverseMediaPerOnboarding = 'adverse_media_per_onboarding',
  adverseMediaPerYear = 'adverse_media_per_year',
  continuousMonitoringPerYear = 'continuous_monitoring_per_year',
  sambaActivityHistory = 'samba_activity_history',
  neuroIdBehavioral = 'neuro_id_behavioral',
  sentilinkScore = 'sentilink_score',
}

/**
 * The price of each product for this tenant, set in cents.
 */
export type TenantBillingProfile = {
  prices: TenantBillingProfilePrices;
  billingEmail?: string;
  pricingDoc?: string;
  minimums: BillingMinimum[];
  platformFeeStartsOn?: string;
  omitBilling: boolean;
  sendAutomatically: boolean;
};

export type BillingMinimum = {
  products: TenantBillingProfileProduct[];
  amountCents: string;
  name: string;
  startsOn?: string | null;
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

export type TenantBusinessInfo = {
  companyName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
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
  businessInfo?: TenantBusinessInfo;
};
