export enum RoleScope {
  read = 'read',
  admin = 'admin',
  onboardingConfiguration = 'onboarding_configuration',
  apiKeys = 'api_keys',
  vaultProxy = 'vault_proxy',
  orgSettings = 'org_settings',
  decryptCustom = 'decrypt_custom',
  decryptDocuments = 'decrypt.document_and_selfie',
  decryptName = 'decrypt.name',
  decryptDob = 'decrypt.dob',
  decryptSsn4 = 'decrypt.ssn4',
  decryptSsn9 = 'decrypt.ssn9',
  decryptFullAddress = 'decrypt.full_address',
  decryptPartialAddress = 'decrypt.partial_address',
  decryptEmail = 'decrypt.email',
  decryptPhoneNumber = 'decrypt.phone_number',
  manualReview = 'manual_review',
}

export type Role = {
  createdAt: string;
  id: string;
  isImmutable: boolean;
  name: string;
  numActiveUsers: number;
  scopes: RoleScope[];
};
