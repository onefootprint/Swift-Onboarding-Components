import { CollectedDataOption } from './collected-data-option';

export enum RoleScopeKind {
  read = 'read',
  admin = 'admin',
  onboardingConfiguration = 'onboarding_configuration',
  apiKeys = 'api_keys',
  vaultProxy = 'vault_proxy',
  orgSettings = 'org_settings',
  manualReview = 'manual_review',
  writeEntities = 'write_entities',
  decryptAll = 'decrypt_all',
  decryptDocuments = 'decrypt_document_and_selfie',
  decrypt = 'decrypt',
  decryptCustom = 'decrypt_custom',
  cipIntegration = 'cip_integration',
  triggerKyc = 'trigger_kyc',
}

export type DecryptRoleScope = {
  kind: RoleScopeKind.decrypt;
  data: CollectedDataOption;
};

export type NonDecryptRoleScope = {
  kind: Exclude<RoleScopeKind, RoleScopeKind.decrypt>;
};

export type RoleScope = NonDecryptRoleScope | DecryptRoleScope;

export type Role = {
  createdAt: string;
  id: string;
  isImmutable: boolean;
  name: string;
  numActiveUsers: number;
  numActiveApiKeys: number;
  scopes: RoleScope[];
};
