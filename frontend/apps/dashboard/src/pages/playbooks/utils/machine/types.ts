import type { CountryRecord } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

export enum PlaybookKind {
  Auth = 'auth',
  Kyb = 'kyb',
  Kyc = 'kyc',
  IdDoc = 'document',
  Unknown = 'unknown',
}

export type DataToCollectFormData = {
  kind: PlaybookKind;
  personal: Personal;
  businessInformation?: BusinessInformation;
  [CollectedInvestorProfileDataOption.investorProfile]?: boolean;
};

export type DataToCollectMeta = {
  kind: PlaybookKind;
  residency?: ResidencyFormData;
  onboardingTemplate?: OnboardingTemplate;
};

export type NameFormData = {
  kind: PlaybookKind;
  name: string;
};

export const defaultNameValue = '';

export const defaultNameFormData: NameFormData = {
  kind: PlaybookKind.Kyc,
  name: defaultNameValue,
};

export enum CountryRestriction {
  all = 'all',
  restrict = 'restrict',
}

export type ResidencyFormData = {
  allowUsResidents: boolean;
  allowUsTerritories: boolean;
  allowInternationalResidents: boolean;
  restrictCountries?: CountryRestriction;
  countryList?: CountryRecord[];
};

export const defaultResidencyFormData: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: false,
  allowInternationalResidents: false,
  restrictCountries: CountryRestriction.all,
};

export const defaultResidencyFormDataAlpaca: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: true,
  allowInternationalResidents: false,
};

export enum KycOptionsForBeneficialOwners {
  all = 'all',
  primary = 'primary',
}
export const defaultResidencyFormDataApex: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: true,
  allowInternationalResidents: false,
};

export const defaultResidencyFormDataTenantScreening: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: false,
  allowInternationalResidents: false,
};

export const defaultResidencyFormDataCarRental: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: false,
  allowInternationalResidents: false,
};

export const defaultResidencyFormDataCreditCard: ResidencyFormData = {
  allowUsResidents: true,
  allowUsTerritories: false,
  allowInternationalResidents: false,
};

export type VerificationChecksFormData = {
  amlFormData: AMLFormData;
  kybKind?: KybChecksKind;
  kycOptionForBeneficialOwners?: KycOptionsForBeneficialOwners;
  runKyb?: boolean;
  skipKyc?: boolean;
};

export type KybChecksKind = 'full' | 'ein';

export type AMLFormData = {
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
};

export const defaultAmlFormData: AMLFormData = {
  enhancedAml: false,
  ofac: false,
  pep: false,
  adverseMedia: false,
};

export const defaultAmlFormDataAlpaca: AMLFormData = {
  enhancedAml: true,
  ofac: true,
  pep: true,
  adverseMedia: true,
};

export const defaultAmlFormDataApex: AMLFormData = {
  enhancedAml: true,
  ofac: true,
  pep: true,
  adverseMedia: true,
};

export const defaultAmlFormDataTenantScreening: AMLFormData = {
  enhancedAml: false,
  ofac: false,
  pep: false,
  adverseMedia: false,
};

export const defaultAmlFormDataCarRental: AMLFormData = {
  enhancedAml: false,
  ofac: false,
  pep: false,
  adverseMedia: false,
};

export const defaultAmlFormDataCreditCard: AMLFormData = {
  enhancedAml: false,
  ofac: false,
  pep: false,
  adverseMedia: false,
};

export type DefaultValues = {
  aml: AMLFormData;
  name: NameFormData;
  playbook: DataToCollectFormData;
  residency: ResidencyFormData;
};

export type Personal = {
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.dob]: boolean;
  [CollectedKycDataOption.usLegalStatus]: boolean;
  [CollectedKycDataOption.address]: boolean;
  ssn: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  idDoc: boolean;
  idDocKind: SupportedIdDocTypes[];
  countrySpecificIdDocKind: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  idDocFirst?: boolean;
  selfie?: boolean;
  ssnOptional?: boolean;
  ssnDocScanStepUp?: boolean;
};

export type BusinessInformation = {
  [CollectedKybDataOption.name]: boolean;
  [CollectedKybDataOption.beneficialOwners]: boolean;
  [CollectedKybDataOption.address]: boolean;
  [CollectedKybDataOption.tin]: boolean;
  [CollectedKybDataOption.corporationType]: boolean;
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
};

export const defaultBusinessInformation = {
  [CollectedKybDataOption.name]: true,
  [CollectedKybDataOption.beneficialOwners]: true,
  [CollectedKybDataOption.address]: true,
  [CollectedKybDataOption.tin]: true,
  [CollectedKybDataOption.corporationType]: false,
  [CollectedKybDataOption.website]: false,
  [CollectedKybDataOption.phoneNumber]: false,
};

export const defaultPlaybookValuesAuth = {
  aml: defaultAmlFormData,
  name: { kind: PlaybookKind.Auth, name: '' },
  playbook: {
    kind: PlaybookKind.Auth,
    investor_profile: false,
    personal: {
      email: true,
      phone_number: true,
      dob: false,
      full_address: false,
      idDoc: false,
      idDocKind: [],
      countrySpecificIdDocKind: {},
      name: false,
      ssn: false,
      us_legal_status: false,
    },
  },
  residency: {
    allowUsResidents: true,
    allowUsTerritories: false,
    allowInternationalResidents: false,
  },
};

export const defaultPlaybookValuesKYC: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: false,
    email: true,
    idDoc: false,
    idDocKind: [],
    countrySpecificIdDocKind: {},
    selfie: true,
    ssn: true,
    ssnDocScanStepUp: false,
    ssnKind: CollectedKycDataOption.ssn9,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesAlpaca: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: true,
    email: true,
    idDoc: false,
    idDocKind: [],
    countrySpecificIdDocKind: {},
    selfie: false,
    ssn: true,
    ssnDocScanStepUp: false,
    ssnKind: CollectedKycDataOption.ssn9,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesApex: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: true,
    email: true,
    idDoc: false,
    idDocKind: [],
    countrySpecificIdDocKind: {},
    selfie: false,
    ssn: true,
    ssnDocScanStepUp: false,
    ssnKind: CollectedKycDataOption.ssn9,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesTenantScreening: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: false,
    email: true,
    idDoc: true,
    idDocKind: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.passportCard,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
    ],
    countrySpecificIdDocKind: {},
    selfie: true,
    ssn: true,
    ssnKind: CollectedKycDataOption.ssn9,
    ssnOptional: true,
  },
};

export const defaultPlaybookValuesCarRental: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: false,
    email: true,
    idDoc: true,
    idDocKind: [SupportedIdDocTypes.driversLicense],
    countrySpecificIdDocKind: {},
    selfie: true,
    ssn: false,
    idDocFirst: true,
  },
};

export const defaultPlaybookValuesCreditCard: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: false,
    email: true,
    idDoc: false,
    idDocKind: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passportCard,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.workPermit,
      SupportedIdDocTypes.voterIdentification,
    ],
    countrySpecificIdDocKind: {},
    selfie: true,
    ssn: true,
    ssnDocScanStepUp: true,
    ssnKind: CollectedKycDataOption.ssn9,
    ssnOptional: true,
  },
};

export const defaultPlaybookValuesIdDoc: DataToCollectFormData = {
  kind: PlaybookKind.IdDoc,
  personal: {
    email: false,
    idDoc: true,
    idDocKind: [],
    countrySpecificIdDocKind: {},
    selfie: false,
    ssn: false,
    [CollectedKycDataOption.phoneNumber]: false,
    [CollectedKycDataOption.dob]: false,
    [CollectedKycDataOption.usLegalStatus]: false,
    [CollectedKycDataOption.address]: false,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesKYB: DataToCollectFormData = {
  ...defaultPlaybookValuesKYC,
  kind: PlaybookKind.Kyb,
  businessInformation: defaultBusinessInformation,
};

export enum OnboardingTemplate {
  Custom = 'custom',
  Alpaca = 'alpaca',
  Apex = 'apex',
  TenantScreening = 'tenant-screening',
  CarRental = 'car-rental',
  CreditCard = 'credit-card',
}

export type MachineContext = {
  kind: PlaybookKind;
  nameForm?: NameFormData;
  playbook?: DataToCollectFormData;
  residencyForm?: ResidencyFormData;
  onboardingTemplate?: OnboardingTemplate;
  verificationChecksForm?: VerificationChecksFormData;
};

export type MachineEvents =
  | { type: 'navigationBackward' }
  | { type: 'nameYourPlaybookSelected' }
  | { type: 'whoToOnboardSelected' }
  | { type: 'dataToCollectSelected' }
  | { type: 'templateSelected' }
  | { type: 'whoToOnboardSubmitted'; payload: { kind: PlaybookKind } }
  | { type: 'nameYourPlaybookSubmitted'; payload: { formData: NameFormData } }
  | { type: 'residencySubmitted'; payload: { formData: ResidencyFormData } }
  | { type: 'playbookSubmitted'; payload: { formData: DataToCollectFormData } }
  | {
      type: 'onboardingTemplatesSelected';
      payload: {
        onboardingTemplate: OnboardingTemplate;
      };
    }
  | {
      type: 'verificationChecksSubmitted';
      payload: { formData: VerificationChecksFormData };
    };

export const basicInformationFields: string[] = [
  CollectedKycDataOption.email,
  CollectedKycDataOption.phoneNumber,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
  CollectedKycDataOption.nationality,
];

// used within Playbook forms before submitting
export const usResidentFormFields = [
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
  CollectedDocumentDataOption.document,
  'idDoc',
  'idDocKind',
  'selfie',
  // note: internal usLegalStatus corresponds to "Legal status in the US"
  CollectedKycDataOption.usLegalStatus,
  'ssnKind',
  'ssn',
];

// used to display
export const usResidentDisplayFields = [
  CollectedDocumentDataOption.document,
  'selfie',
  CollectedKycDataOption.usLegalStatus,
  'ssn',
];

export const usResidentDisplayScopes = [
  'selfie',
  'document',
  CollectedKycDataOption.usLegalStatus,
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
];
