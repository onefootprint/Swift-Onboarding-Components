import { CollectedKycDataOption } from './collected-kyc-data-option';

export enum OrgRolePermissionKind {
  admin = 'admin',
  onboardingConfiguration = 'onboarding_configuration',
  apiKeys = 'api_keys',
  orgSettings = 'org_settings',
  securityLogs = 'security_logs',
  users = 'users',
  decryptCustom = 'decrypt_custom',
  decrypt = 'decrypt',
}

export type OrgRolePermissionAdmin = {
  kind: OrgRolePermissionKind.admin;
};

export type OrgRolePermissionOnboardingConfiguration = {
  kind: OrgRolePermissionKind.onboardingConfiguration;
};

export type OrgRolePermissionApiKeys = {
  kind: OrgRolePermissionKind.apiKeys;
};

export type OrgRolePermissionOrgSettings = {
  kind: OrgRolePermissionKind.orgSettings;
};

export type OrgRolePermissionSecurityLogs = {
  kind: OrgRolePermissionKind.securityLogs;
};

export type OrgRolePermissionUsers = {
  kind: OrgRolePermissionKind.users;
};

export type OrgRolePermissionDecryptCustom = {
  kind: OrgRolePermissionKind.decryptCustom;
};

export type OrgRolePermissionDecrypt = {
  kind: OrgRolePermissionKind.decrypt;
  attributes: CollectedKycDataOption[];
};

export type OrgRolePermission =
  | OrgRolePermissionAdmin
  | OrgRolePermissionOnboardingConfiguration
  | OrgRolePermissionApiKeys
  | OrgRolePermissionOrgSettings
  | OrgRolePermissionSecurityLogs
  | OrgRolePermissionUsers
  | OrgRolePermissionDecryptCustom
  | OrgRolePermissionDecrypt;
