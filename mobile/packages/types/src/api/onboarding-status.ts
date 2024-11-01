import type {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '../data/collected-data-option';
import { DocumentRequestKind } from '../data/document-request-config';
import type { SupportedIdDocTypes } from '../data/id-doc-type';

export enum OnboardingRequirementKind {
  liveness = 'liveness',
  idDoc = 'collect_document',
  collectKycData = 'collect_data',
  collectKybData = 'collect_business_data',
  investorProfile = 'collect_investor_profile',
  authorize = 'authorize',
  process = 'process',
}

export type CollectKybDataRequirement = {
  kind: OnboardingRequirementKind.collectKybData;
  isMet: boolean;
  missingAttributes: CollectedKybDataOption[];
};

export type CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData;
  isMet: boolean;
  missingAttributes: CollectedKycDataOption[];
  populatedAttributes: CollectedKycDataOption[];
  optionalAttributes: CollectedKycDataOption[];
};

export type CollectInvestorProfileRequirement = {
  kind: OnboardingRequirementKind.investorProfile;
  isMet: boolean;
  missingAttributes: CollectedInvestorProfileDataOption[];
};

export type IdDocSupportedCountryAndDocTypes = Record<string, SupportedIdDocTypes[]>;

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

export type IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc;
  isMet: boolean;
  documentRequestId: string;
  uploadSettings: DocumentUploadSettings;
  config: DocumentRequirementConfig;
};

export type IdDocRequirementConfig = {
  kind: DocumentRequestKind.Identity;
  shouldCollectSelfie: boolean;
  shouldCollectConsent: boolean;
  supportedCountryAndDocTypes: Record<string, SupportedIdDocTypes[]>;
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
};

export type DocumentRequirementConfig =
  | IdDocRequirementConfig
  | ProofOfAddressRequirementConfig
  | ProofOfSsnRequirementConfig
  | CustomDocumentRequirementConfig;

export type LivenessRequirement = {
  kind: OnboardingRequirementKind.liveness;
  isMet: boolean;
};

export type AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize;
  isMet: boolean;
  fieldsToAuthorize: AuthorizeFields;
};

export type ProcessRequirement = {
  kind: OnboardingRequirementKind.process;
  isMet: boolean;
};

export type OnboardingRequirement =
  | CollectKybDataRequirement
  | CollectKycDataRequirement
  | CollectInvestorProfileRequirement
  | IdDocRequirement
  | LivenessRequirement
  | AuthorizeRequirement
  | ProcessRequirement;

export type OnboardingStatusRequest = {
  authToken: string;
};

export type AuthorizeFields = {
  collectedData: CollectedKycDataOption[];
  identityDocumentTypes: SupportedIdDocTypes[];
};

export type OnboardingStatusResponse = {
  allRequirements: OnboardingRequirement[];
};

export type RequirementForKind<K> = K extends OnboardingRequirementKind.liveness
  ? LivenessRequirement
  : K extends OnboardingRequirementKind.idDoc
    ? IdDocRequirement
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

export const getRequirement = <K extends OnboardingRequirementKind>(reqs: OnboardingRequirement[], kind: K) => {
  const found = reqs.find(req => req.kind === kind);
  return found as RequirementForKind<K> | undefined;
};

export const isIdentitydDoc = (config?: DocumentRequirementConfig): config is IdDocRequirementConfig =>
  config?.kind === DocumentRequestKind.Identity;
