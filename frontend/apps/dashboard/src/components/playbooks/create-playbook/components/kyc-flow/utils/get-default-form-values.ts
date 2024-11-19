import { OnboardingTemplate } from '../components/templates-step';
import type { State } from './reducer/reducer';

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
  detailsForm: {
    person: {
      address: true,
      dob: true,
      email: true,
      phoneNumber: true,
      usLegalStatus: false,
      ssn: {
        collect: true,
        kind: 'ssn9',
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
      adverseMediaList: {
        financial_crime: false,
        violent_crime: false,
        sexual_crime: false,
        cyber_crime: false,
        terrorism: false,
        fraud: false,
        narcotics: false,
        general_serious: false,
        general_minor: false,
      },
      matchingMethod: {
        kind: 'fuzzy',
        fuzzyLevel: 'fuzzy_low',
        exactLevel: 'exact_name',
      },
    },
    runKyc: true,
    isNeuroEnabled: false,
    isSentilinkEnabled: false,
  },
};

export const templateValues: Record<OnboardingTemplate, Partial<State['data']>> = {
  [OnboardingTemplate.Custom]: {
    residencyForm: defaultFormValues.residencyForm,
    detailsForm: defaultFormValues.detailsForm,
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
    detailsForm: {
      ...defaultFormValues.detailsForm,
      person: {
        ...defaultFormValues.detailsForm.person,
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
        adverseMediaList: {
          financial_crime: true,
          violent_crime: true,
          sexual_crime: true,
          cyber_crime: true,
          terrorism: true,
          fraud: true,
          narcotics: true,
          general_serious: true,
          general_minor: true,
        },
        matchingMethod: {
          kind: 'fuzzy',
          fuzzyLevel: 'fuzzy_low',
          exactLevel: 'exact_name',
        },
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
    detailsForm: {
      ...defaultFormValues.detailsForm,
      person: {
        ...defaultFormValues.detailsForm.person,
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
        adverseMediaList: {
          financial_crime: true,
          violent_crime: true,
          sexual_crime: true,
          cyber_crime: true,
          terrorism: true,
          fraud: true,
          narcotics: true,
          general_serious: true,
          general_minor: true,
        },
        matchingMethod: {
          kind: 'fuzzy',
          fuzzyLevel: 'fuzzy_low',
          exactLevel: 'exact_name',
        },
      },
    },
  },
  [OnboardingTemplate.TenantScreening]: {
    residencyForm: defaultFormValues.residencyForm,
    detailsForm: {
      ...defaultFormValues.detailsForm,
      gov: {
        country: {},
        global: ['drivers_license', 'passport', 'id_card', 'residence_document', 'passport_card', 'visa', 'permit'],
        selfie: true,
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
  [OnboardingTemplate.CarRental]: {
    residencyForm: defaultFormValues.residencyForm,
    detailsForm: {
      ...defaultFormValues.detailsForm,
      gov: {
        country: {},
        global: ['drivers_license'],
        selfie: true,
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
  [OnboardingTemplate.CreditCard]: {
    residencyForm: defaultFormValues.residencyForm,
    detailsForm: {
      ...defaultFormValues.detailsForm,
      gov: {
        country: {},
        global: [
          'drivers_license',
          'passport',
          'id_card',
          'passport_card',
          'visa',
          'residence_document',
          'permit',
          'voter_identification',
        ],
        selfie: true,
        idDocFirst: false,
      },
    },
    requiredAuthMethodsForm: defaultFormValues.requiredAuthMethodsForm,
    verificationChecksForm: defaultFormValues.verificationChecksForm,
  },
};
