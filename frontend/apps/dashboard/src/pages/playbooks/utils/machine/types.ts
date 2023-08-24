import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

export type PlaybookFormData = {
  personalInformationAndDocs: PersonalInformationAndDocs;
  businessInformation?: BusinessInformation;
  [CollectedInvestorProfileDataOption.investorProfile]?: boolean;
};

export type NameFormData = {
  name: string;
};

export const defaultNameValue = '';

export type AuthorizedScopesFormData = {
  [CollectedKycDataOption.name]: boolean;
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.name]: boolean;
  [CollectedKycDataOption.dob]: boolean;
  [CollectedKycDataOption.fullAddress]: boolean;
  [CollectedKycDataOption.ssn4]?: boolean;
  [CollectedKycDataOption.ssn9]?: boolean;
  [CollectedKycDataOption.nationality]?: boolean;
  [CollectedDocumentDataOption.document]?: boolean;
  [CollectedInvestorProfileDataOption.investorProfile]?: boolean;
  allBusinessData?: boolean;
};

export type PersonalInformationAndDocs = {
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.dob]: boolean;
  [CollectedKycDataOption.nationality]: boolean;
  [CollectedKycDataOption.fullAddress]: boolean;
  ssn: boolean;
  ssnKind?: CollectedKycDataOption;
  idDoc: boolean;
  idDocKind: SupportedIdDocTypes[];
  idDocFirst?: boolean;
  selfie?: boolean;
  ssnOptional?: boolean;
};

export type BusinessInformation = {
  [CollectedKybDataOption.name]: boolean;
  doingBusinessAs?: boolean;
  [CollectedKybDataOption.beneficialOwners]: boolean;
  [CollectedKybDataOption.address]: boolean;
  [CollectedKybDataOption.tin]: boolean;
  [CollectedKybDataOption.corporationType]: boolean;
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
};

export const defaultBusinessInformation = {
  [CollectedKybDataOption.name]: true,
  doingBusinessAs: true,
  [CollectedKybDataOption.beneficialOwners]: true,
  [CollectedKybDataOption.address]: true,
  [CollectedKybDataOption.tin]: true,
  [CollectedKybDataOption.corporationType]: false,
  [CollectedKybDataOption.website]: false,
  [CollectedKybDataOption.phoneNumber]: false,
};

export const defaultPlaybookValuesKYC: PlaybookFormData = {
  personalInformationAndDocs: {
    email: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.nationality]: false,
    [CollectedKycDataOption.fullAddress]: true,
    ssn: true,
    idDoc: false,
    ssnKind: CollectedKycDataOption.ssn9,
    idDocKind: [],
    selfie: true,
  },
  [CollectedInvestorProfileDataOption.investorProfile]: false,
};

export const defaultPlaybookValuesKYB: PlaybookFormData = {
  ...defaultPlaybookValuesKYC,
  businessInformation: defaultBusinessInformation,
};

export const defaultAuthorizedScopesValues: AuthorizedScopesFormData = {
  [CollectedKycDataOption.email]: true,
  [CollectedKycDataOption.phoneNumber]: true,
  [CollectedKycDataOption.name]: true,
  [CollectedKycDataOption.dob]: true,
  [CollectedKycDataOption.fullAddress]: true,
  [CollectedKycDataOption.ssn4]: false,
  [CollectedKycDataOption.ssn9]: true,
  [CollectedKycDataOption.nationality]: true,
  [CollectedDocumentDataOption.document]: true,
  [CollectedInvestorProfileDataOption.investorProfile]: true,
  allBusinessData: true,
};

export enum Kind {
  KYB = 'kyb',
  KYC = 'kyc',
}

export type MachineContext = {
  kind?: Kind;
  name?: string;
  playbook?: PlaybookFormData;
};

export type MachineEvents =
  | {
      type: 'nameYourPlaybookSubmitted';
      payload: {
        name: string;
      };
    }
  | {
      type: 'whoToOnboardSubmitted';
      payload: {
        kind: Kind;
      };
    }
  | {
      type: 'nameYourPlaybookSelected';
    }
  | {
      type: 'whoToOnboardSelected';
    }
  | {
      type: 'yourPlaybookSelected';
    }
  | {
      type: 'playbookSubmitted';
      payload: {
        playbook: PlaybookFormData;
      };
    };

export const basicInformationFields: string[] = [
  CollectedKycDataOption.email,
  CollectedKycDataOption.phoneNumber,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.fullAddress,
];

// used within Playbook forms before submitting
export const usResidentFormFields = [
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
  CollectedDocumentDataOption.document,
  'selfie',
  'idDoc',
  'idDocKind',
  'ssnKind',
  'ssn',
  // note: internal nationality corresponds to "Legal status in the US"
  CollectedKycDataOption.nationality,
];

// used to display
export const usResidentDisplayFields = [
  CollectedDocumentDataOption.document,
  'selfie',
  CollectedKycDataOption.nationality,
  'ssn',
];

export const usResidentDisplayScopes = [
  'selfie',
  'document',
  CollectedKycDataOption.nationality,
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
];
