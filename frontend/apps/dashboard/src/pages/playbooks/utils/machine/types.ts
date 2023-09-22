import type { CountryRecord } from '@onefootprint/global-constants';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

export enum PlaybookKind {
  Unknown = 'unknown',
  Kyb = 'kyb',
  Kyc = 'kyc',
}

export type SummaryFormData = {
  kind: PlaybookKind;
  personal: Personal;
  businessInformation?: BusinessInformation;
  [CollectedInvestorProfileDataOption.investorProfile]?: boolean;
};

export type SummaryMeta = {
  kind: PlaybookKind;
  residency?: ResidencyFormData;
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

export type AuthorizedScopesFormData = {
  [CollectedKycDataOption.name]: boolean;
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.dob]: boolean;
  [CollectedKycDataOption.address]: boolean;
  [CollectedKycDataOption.ssn4]?: boolean;
  [CollectedKycDataOption.ssn9]?: boolean;
  [CollectedKycDataOption.usLegalStatus]?: boolean;
  [CollectedDocumentDataOption.document]?: boolean;
  [CollectedInvestorProfileDataOption.investorProfile]?: boolean;
  allBusinessData?: boolean;
};

export const defaultAuthorizedScopesValues: AuthorizedScopesFormData = {
  [CollectedKycDataOption.email]: true,
  [CollectedKycDataOption.phoneNumber]: true,
  [CollectedKycDataOption.name]: true,
  [CollectedKycDataOption.dob]: true,
  [CollectedKycDataOption.address]: true,
  [CollectedKycDataOption.ssn4]: true,
  [CollectedKycDataOption.ssn9]: true,
  [CollectedKycDataOption.usLegalStatus]: true,
  [CollectedDocumentDataOption.document]: true,
  [CollectedInvestorProfileDataOption.investorProfile]: true,
  allBusinessData: true,
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

export const defaultPlaybookValuesKYC: SummaryFormData = {
  kind: PlaybookKind.Kyc,
  personal: {
    [CollectedKycDataOption.address]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.usLegalStatus]: false,
    email: true,
    idDoc: false,
    idDocKind: [],
    selfie: true,
    ssn: true,
    ssnDocScanStepUp: false,
    ssnKind: CollectedKycDataOption.ssn9,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesKYB: SummaryFormData = {
  ...defaultPlaybookValuesKYC,
  kind: PlaybookKind.Kyb,
  businessInformation: defaultBusinessInformation,
};

export type MachineContext = {
  kind: PlaybookKind;
  nameForm?: NameFormData;
  playbook?: SummaryFormData;
  residencyForm?: ResidencyFormData;
  authorizedScopesForm?: AuthorizedScopesFormData;
  amlForm?: AMLFormData;
};

export type MachineEvents =
  | {
      type: 'navigationBackward';
    }
  | {
      type: 'nameYourPlaybookSelected';
    }
  | {
      type: 'whoToOnboardSelected';
    }
  | {
      type: 'summarySelected';
    }
  | {
      type: 'authorizedScopesSelected';
    }
  | {
      type: 'whoToOnboardSubmitted';
      payload: {
        kind: PlaybookKind;
      };
    }
  | {
      type: 'nameYourPlaybookSubmitted';
      payload: {
        formData: NameFormData;
      };
    }
  | {
      type: 'residencySubmitted';
      payload: {
        formData: ResidencyFormData;
      };
    }
  | {
      type: 'playbookSubmitted';
      payload: {
        formData: SummaryFormData;
      };
    }
  | {
      type: 'authorizedScopesSubmitted';
      payload: {
        formData: AuthorizedScopesFormData;
      };
    }
  | {
      type: 'amlSubmitted';
      payload: {
        formData: AMLFormData;
      };
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
