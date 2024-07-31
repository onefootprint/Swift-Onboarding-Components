import type { CountryRecord } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { CollectedDocumentDataOption, CollectedKycDataOption, SupportedIdDocTypes } from '@onefootprint/types';

export enum PlaybookKind {
  Auth = 'auth',
  Kyb = 'kyb',
  Kyc = 'kyc',
  DocOnly = 'document',
  Unknown = 'unknown',
}

export type DataToCollectFormData = {
  kind: PlaybookKind;
  person: Person;
  business?: Business;
};

export type DataToCollectMeta = {
  kind: PlaybookKind;
  residency?: ResidencyFormData;
  onboardingTemplate?: OnboardingTemplate;
};

export type NameFormData = {
  name: string;
};

export const defaultNameFormData: NameFormData = {
  name: '',
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

export type GovDocs = {
  global: SupportedIdDocTypes[];
  country: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  selfie?: boolean;
  idDocFirst?: boolean;
};

export type CustomDoc = {
  name: string;
  identifier: string;
  description?: string;
};

export type AdditionalDocs = {
  requireManualReview?: boolean;
  poa?: boolean;
  possn?: boolean;
  custom?: CustomDoc[];
};

export type Person = {
  basic: {
    email: boolean;
    phoneNumber: boolean;
    dob: boolean;
    usLegalStatus: boolean;
    address: boolean;
    ssn: {
      collect: boolean;
      optional: boolean;
      kind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
    };
    usTaxIdAcceptable: boolean;
  };
  docs: {
    gov: GovDocs;
    additional: AdditionalDocs;
  };
  investorProfile: boolean;
};

export type Business = {
  basic: {
    address: boolean;
    collectBOInfo: boolean;
    name: boolean;
    phoneNumber: boolean;
    tin: boolean;
    type: boolean;
    website: boolean;
  };
  docs: {
    custom: CustomDoc[];
  };
};

export const defaultBusinessInformation = {
  basic: {
    address: true,
    collectBOInfo: true,
    name: true,
    phoneNumber: false,
    tin: true,
    type: false,
    website: false,
  },
  docs: {
    custom: [],
  },
};

export const defaultPlaybookValuesAuth: DataToCollectFormData = {
  kind: PlaybookKind.Auth,
  person: {
    basic: {
      address: false,
      dob: false,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: false,
        optional: false,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesKYC: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: true,
        optional: false,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesAlpaca: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: true,
      usTaxIdAcceptable: false,
      ssn: {
        collect: true,
        optional: false,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesApex: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: true,
      usTaxIdAcceptable: false,
      ssn: {
        collect: true,
        optional: false,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesTenantScreening: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: true,
        optional: true,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.residenceDocument,
          SupportedIdDocTypes.passportCard,
          SupportedIdDocTypes.visa,
          SupportedIdDocTypes.workPermit,
        ],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesCarRental: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: false,
        optional: true,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [SupportedIdDocTypes.driversLicense],
        selfie: true,
        idDocFirst: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesCreditCard: DataToCollectFormData = {
  kind: PlaybookKind.Kyc,
  person: {
    basic: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: true,
        optional: true,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.passportCard,
          SupportedIdDocTypes.visa,
          SupportedIdDocTypes.residenceDocument,
          SupportedIdDocTypes.workPermit,
          SupportedIdDocTypes.voterIdentification,
        ],
        selfie: true,
        idDocFirst: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesIdDoc: DataToCollectFormData = {
  kind: PlaybookKind.DocOnly,
  person: {
    basic: {
      address: false,
      dob: false,
      email: false,
      phoneNumber: false,
      usLegalStatus: false,
      usTaxIdAcceptable: false,
      ssn: {
        collect: false,
        optional: false,
        kind: CollectedKycDataOption.ssn9,
      },
    },
    investorProfile: false,
    docs: {
      gov: {
        country: {},
        global: [],
        selfie: true,
      },
      additional: {
        custom: [],
        poa: false,
        possn: false,
      },
    },
  },
};

export const defaultPlaybookValuesKYB: DataToCollectFormData = {
  ...defaultPlaybookValuesKYC,
  kind: PlaybookKind.Kyb,
  business: defaultBusinessInformation,
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
  | { type: 'kindSelected' }
  | { type: 'settingsKycSelected' }
  | { type: 'settingBusinessSelected' }
  | { type: 'settingsBoSelected' }
  | { type: 'settingsDocOnlySelected' }
  | { type: 'settingsAuthSelected' }
  | { type: 'templateSelected' }
  | { type: 'kindSubmitted'; payload: { kind: PlaybookKind } }
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
