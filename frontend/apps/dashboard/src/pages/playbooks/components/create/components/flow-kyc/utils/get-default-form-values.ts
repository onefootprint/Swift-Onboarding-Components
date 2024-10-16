import { CollectedKycDataOption, SupportedIdDocTypes } from '@onefootprint/types';
import { OnboardingTemplate } from '../../step-kyc-templates';
import type { State } from './reducer';

export const defaultFormValues: State['data'] = {
  nameForm: {
    name: '',
  },
  templateForm: {
    template: OnboardingTemplate.Custom,
  },
  residencyForm: {
    residencyType: 'us',
    allowUsTerritories: false,
    isCountryRestricted: false,
    countryList: [],
  },
  kycForm: {
    person: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      ssn: {
        collect: true,
        kind: CollectedKycDataOption.ssn9,
        optional: false,
      },
      usTaxIdAcceptable: false,
    },
    docs: {
      poa: false,
      possn: false,
      custom: [],
      requireManualReview: false,
    },
    gov: {
      country: {},
      global: [],
      selfie: true,
      idDocFirst: false,
    },
    investor: {
      collect: false,
    },
  },
  requiredAuthMethodsForm: {
    email: false,
    phone: true,
  },
  verificationChecksForm: {
    aml: {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
      hasOptionSelected: false,
    },
    runKyc: true,
    isNeuroEnabled: false,
    isSentilinkEnabled: false,
  },
};

export const templateValues: Record<OnboardingTemplate, Partial<State['data']>> = {
  [OnboardingTemplate.Custom]: {
    residencyForm: defaultFormValues.residencyForm,
    kycForm: defaultFormValues.kycForm,
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
  [OnboardingTemplate.Alpaca]: {
    residencyForm: {
      residencyType: 'us',
      allowUsTerritories: true,
      isCountryRestricted: false,
      countryList: [],
    },
    kycForm: {
      ...defaultFormValues.kycForm,
      person: {
        ...defaultFormValues.kycForm.person,
        usLegalStatus: true,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: {
      ...defaultFormValues.verificationChecksForm,
      aml: {
        enhancedAml: true,
        ofac: true,
        pep: true,
        adverseMedia: true,
        hasOptionSelected: true,
      },
    },
  },
  [OnboardingTemplate.Apex]: {
    residencyForm: {
      residencyType: 'us',
      allowUsTerritories: true,
      isCountryRestricted: false,
      countryList: [],
    },
    kycForm: {
      ...defaultFormValues.kycForm,
      person: {
        ...defaultFormValues.kycForm.person,
        usLegalStatus: true,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: {
      ...defaultFormValues.verificationChecksForm,
      aml: {
        enhancedAml: true,
        ofac: true,
        pep: true,
        adverseMedia: true,
        hasOptionSelected: true,
      },
    },
  },
  [OnboardingTemplate.TenantScreening]: {
    residencyForm: defaultFormValues.residencyForm,
    kycForm: {
      ...defaultFormValues.kycForm,
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
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
  [OnboardingTemplate.CarRental]: {
    residencyForm: defaultFormValues.residencyForm,
    kycForm: {
      ...defaultFormValues.kycForm,
      gov: {
        country: {},
        global: [SupportedIdDocTypes.driversLicense],
        selfie: true,
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
  [OnboardingTemplate.CreditCard]: {
    residencyForm: defaultFormValues.residencyForm,
    kycForm: {
      ...defaultFormValues.kycForm,
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
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
};
