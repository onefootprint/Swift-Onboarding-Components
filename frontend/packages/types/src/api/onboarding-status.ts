import type { AuthMethodKind, CountryCode, CustomDocumentUploadSettings, DocumentRequestKind } from '..';
import type {
  CollectedDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import type { SupportedIdDocTypes } from '../data/id-doc-type';

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export enum OnboardingRequirementKind {
  registerAuthMethod = 'register_auth_method',
  registerPasskey = 'liveness', // TODO: eventually we need to synchronously rename `liveness` or create a duplicate
  document = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  createBusinessOnboarding = 'create_business_onboarding',
  investorProfile = 'collect_investor_profile',
  authorize = 'authorize',
  process = 'process',
}

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type RegisterAuthMethodRequirement = {
  kind: OnboardingRequirementKind.registerAuthMethod;
  isMet: boolean;
  authMethodKind: AuthMethodKind;
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type CreateBusinessOnboardingRequirement = {
  kind: OnboardingRequirementKind.createBusinessOnboarding;
  requiresBusinessSelection: boolean;
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type CollectKybDataRequirement = {
  kind: OnboardingRequirementKind.collectKybData;
  isMet: boolean;
  missingAttributes: CollectedKybDataOption[];
  populatedAttributes: CollectedKybDataOption[];
  recollectAttributes: CollectedKybDataOption[];
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  isMet: boolean;
  missingAttributes: CollectedKycDataOption[];
  populatedAttributes: CollectedKycDataOption[];
  recollectAttributes: CollectedKybDataOption[];
  optionalAttributes: CollectedKycDataOption[];
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  isMet: boolean;
  missingAttributes: CollectedInvestorProfileDataOption[];
  missingDocument?: boolean;
  populatedAttributes: CollectedInvestorProfileDataOption[];
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type DocumentRequirement<TConfig = DocumentRequirementConfig> = {
  kind: OnboardingRequirementKind.document;
  isMet: boolean;
  documentRequestId: string;
  uploadSettings: DocumentUploadSettings;
  config: TConfig;
};

export enum DocumentUploadSettings {
  /**
   * Useful for documents that are usually uploaded as a captured image, like an SSN card or
   * driver's license. When on desktop, we prefer to hand off these document requirements to
   * mobile for capture. And on mobile, we will show the capture interface with an option to
   * upload.
   */
  preferCapture = 'prefer_capture',
  /**
   * Useful for documents that are usually uploaded as a file image, like a lease or utility
   * bill. When on desktop, we first give the option to upload on desktop but fall back to
   * handoff to mobile. And on mobile, we will show the option to upload or capture.
   */
  preferUpload = 'prefer_upload',
  /**
   * Not configurable by tenants yet, only used by Coba for their identity documents.
   * On mobile, only allows capturing without the option to upload.
   * On desktop though, we will allow uploading if the user didn't hand off
   */
  captureOnlyOnMobile = 'capture_only_on_mobile',
}

export type IdDocRequirementConfig = {
  kind: DocumentRequestKind.Identity;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
  supportedCountryAndDocTypes: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
};

export type ProofOfAddressRequirementConfig = {
  kind: DocumentRequestKind.ProofOfAddress;
};

export type ProofOfSsnRequirementConfig = {
  kind: DocumentRequestKind.ProofOfSsn;
};

export type CustomDocumentRequirementConfig = {
  kind: DocumentRequestKind.Custom;
  name: string;
  description?: string;
  uploadSettings: CustomDocumentUploadSettings;
};

export type DocumentRequirementConfig =
  | IdDocRequirementConfig
  | ProofOfAddressRequirementConfig
  | ProofOfSsnRequirementConfig
  | CustomDocumentRequirementConfig;

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type RegisterPasskeyRequirement = {
  kind: OnboardingRequirementKind.registerPasskey;
  isMet: boolean;
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize;
  isMet: boolean;
  fieldsToAuthorize: AuthorizeFields;
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type ProcessRequirement = {
  kind: OnboardingRequirementKind.process;
  isMet: boolean;
};

/** Note: these will be a little trickier to migrate to the open API type. The open API type has a new, more modern serialization */
export type OnboardingRequirement =
  | RegisterAuthMethodRequirement
  | CollectKybDataRequirement
  | CollectKycDataRequirement
  | CollectInvestorProfileRequirement
  | DocumentRequirement
  | RegisterPasskeyRequirement
  | AuthorizeRequirement
  | ProcessRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedDataOption[];
  documentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  allRequirements: OnboardingRequirement[];
  canUpdateUserData: boolean;
};

export type RequirementForKind<K> = K extends OnboardingRequirementKind.registerPasskey
  ? RegisterPasskeyRequirement
  : K extends OnboardingRequirementKind.document
    ? DocumentRequirement
    : K extends OnboardingRequirementKind.collectKycData
      ? CollectKycDataRequirement
      : K extends OnboardingRequirementKind.collectKybData
        ? CollectKybDataRequirement
        : K extends OnboardingRequirementKind.investorProfile
          ? CollectInvestorProfileRequirement
          : K extends OnboardingRequirementKind.authorize
            ? AuthorizeRequirement
            : K extends OnboardingRequirementKind.process
              ? ProcessRequirement
              : never;

export const getRequirement = <K extends OnboardingRequirementKind>(reqs: OnboardingRequirement[], kind: K) =>
  getRequirements(reqs, kind)[0];

export const getRequirements = <K extends OnboardingRequirementKind>(reqs: OnboardingRequirement[], kind: K) => {
  const found = reqs.filter(req => req.kind === kind);
  return found as RequirementForKind<K>[];
};
