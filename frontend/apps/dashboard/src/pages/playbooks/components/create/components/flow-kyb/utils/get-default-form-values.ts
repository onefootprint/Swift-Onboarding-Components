import { CollectedKycDataOption } from '@onefootprint/types';
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
    runKyb: true,
    runKyc: true,
    kybKind: 'full',
  },
};
