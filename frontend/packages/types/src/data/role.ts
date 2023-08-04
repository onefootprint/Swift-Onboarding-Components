import { CollectedDataOption } from './collected-data-option';

export enum RoleScopeKind {
  read = 'read',
  admin = 'admin',
  onboardingConfiguration = 'onboarding_configuration',
  apiKeys = 'api_keys',
  orgSettings = 'org_settings',
  manualReview = 'manual_review',
  writeEntities = 'write_entities',
  invokeVaultProxy = 'invoke_vault_proxy',
  decryptAll = 'decrypt_all',
  decryptDocuments = 'decrypt_document_and_selfie',
  decrypt = 'decrypt',
  decryptCustom = 'decrypt_custom',
  cipIntegration = 'cip_integration',
  triggerKyc = 'trigger_kyc',
  manageVaultProxy = 'manage_vault_proxy',
  onboarding = 'onboarding',
  manageWebhooks = 'manage_webhooks',
}

export enum RoleKind {
  dashboardUser = 'dashboard_user',
  apiKey = 'api_key',
}

// Specify which kinds of roles are able to have the given scope
export const supportedRoleKinds: Record<RoleScopeKind, RoleKind[]> = {
  [RoleScopeKind.read]: [RoleKind.dashboardUser, RoleKind.apiKey],
  [RoleScopeKind.admin]: [RoleKind.dashboardUser, RoleKind.apiKey],

  [RoleScopeKind.apiKeys]: [RoleKind.dashboardUser],
  [RoleScopeKind.manageVaultProxy]: [RoleKind.dashboardUser],
  [RoleScopeKind.manageWebhooks]: [RoleKind.dashboardUser],
  [RoleScopeKind.manualReview]: [RoleKind.dashboardUser],
  [RoleScopeKind.onboardingConfiguration]: [RoleKind.dashboardUser],
  [RoleScopeKind.orgSettings]: [RoleKind.dashboardUser],

  [RoleScopeKind.cipIntegration]: [RoleKind.apiKey],
  [RoleScopeKind.invokeVaultProxy]: [RoleKind.apiKey],
  [RoleScopeKind.triggerKyc]: [RoleKind.apiKey],
  [RoleScopeKind.writeEntities]: [RoleKind.apiKey],
  [RoleScopeKind.onboarding]: [RoleKind.apiKey],

  [RoleScopeKind.decryptAll]: [RoleKind.dashboardUser, RoleKind.apiKey],
  [RoleScopeKind.decryptDocuments]: [RoleKind.dashboardUser, RoleKind.apiKey],
  [RoleScopeKind.decrypt]: [RoleKind.dashboardUser, RoleKind.apiKey],
  [RoleScopeKind.decryptCustom]: [RoleKind.dashboardUser, RoleKind.apiKey],
};

export type BasicRoleScopeKind = Exclude<
  RoleScopeKind,
  RoleScopeKind.decrypt | RoleScopeKind.invokeVaultProxy
>;

export type DecryptRoleScope = {
  kind: RoleScopeKind.decrypt;
  data: CollectedDataOption;
};

export type InvokeVaultProxyScopeData =
  | { kind: 'any' }
  | { kind: 'just_in_time' }
  | { kind: 'id'; id: string };

export type InvokeVaultProxyRoleScope = {
  kind: RoleScopeKind.invokeVaultProxy;
  data: InvokeVaultProxyScopeData;
};

export type BasicRoleScope = {
  kind: BasicRoleScopeKind;
};

export type RoleScope =
  | BasicRoleScope
  | DecryptRoleScope
  | InvokeVaultProxyRoleScope;

export type Role = {
  createdAt: string;
  id: string;
  isImmutable: boolean;
  name: string;
  numActiveUsers: number;
  numActiveApiKeys: number;
  scopes: RoleScope[];
  kind: RoleKind;
};
