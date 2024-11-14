export enum RoleScope {
  read = 'read',
  admin = 'admin',
  onboardingConfiguration = 'onboarding_configuration',
  apiKeys = 'api_keys',
  vaultProxy = 'vault_proxy',
  orgSettings = 'org_settings',
  manualReview = 'manual_review',
  decryptName = 'decrypt.name',
  decryptDob = 'decrypt.dob',
  decryptSsn4 = 'decrypt.ssn4',
  decryptSsn9 = 'decrypt.ssn9',
  decryptFullAddress = 'decrypt.full_address',
  decryptEmail = 'decrypt.email',
  decryptPhoneNumber = 'decrypt.phone_number',
  decryptDocuments = 'decrypt.document_and_selfie',
  decryptInvestorProfile = 'decrypt.investor_profile',
  decryptCustom = 'decrypt_custom',
  decryptBusinessName = 'decrypt.business_name',
  decryptBusinessTin = 'decrypt.business_tin',
  decryptBusinessAddress = 'decrypt.business_address',
  decryptBusinessPhoneNumber = 'decrypt.business_phone_number',
  decryptBusinessWebsite = 'decrypt.business_website',
  decryptBusinessCorporationType = 'decrypt.business_corporation_type',
}

export type Role = {
  createdAt: string;
  id: string;
  isImmutable: boolean;
  name: string;
  numActiveUsers: number;
  numActiveApiKeys: number;
  scopes: RoleScope[];
};
