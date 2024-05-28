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
  Labels = 'labels',
  Tags = 'tags',
}

/**
 * The price of each product for this tenant, set in cents.
 */
export type TenantBillingProfile = {
  kyc?: string;
  oneClickKyc?: string;
  kycWaterfallSecondVendor?: string;
  kycWaterfallThirdVendor?: string;

  idDocs?: string;
  kyb?: string;

  pii?: string;
  hotVaults?: string;
  hotProxyVaults?: string;
  vaultsWithNonPci?: string;
  vaultsWithPci?: string;

  watchlist?: string;
  adverseMediaPerUser?: string;
  continuousMonitoringPerYear?: string;

  monthlyMinimum?: string;
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
};
