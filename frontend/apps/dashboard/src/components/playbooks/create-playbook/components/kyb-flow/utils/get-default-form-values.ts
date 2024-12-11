import type { State } from './reducer';

export const defaultFormValues: State['data'] = {
  nameForm: {
    name: '',
  },
  businessForm: {
    data: {
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
  },
  boForm: {
    data: {
      collect: true,
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
  },
  requiredAuthMethodsForm: {
    email: false,
    phone: true,
  },
  verificationChecksForm: {
    businessAml: false,
    runKyb: true,
    runKyc: true,
    kybKind: 'full',
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
  },
};
