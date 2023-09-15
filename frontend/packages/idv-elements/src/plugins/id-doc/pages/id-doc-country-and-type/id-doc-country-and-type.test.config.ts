import { mockRequest } from '@onefootprint/test-utils';
import {
  IdDocImageTypes,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

export const initialContextAllDocTypes: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: false,
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
    ],
    supportedCountries: ['US', 'CA'],
    supportedCountryAndDocTypes: {
      us: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.visa,
        SupportedIdDocTypes.workPermit,
      ],
      ca: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
      ],
    },
  },
  idDoc: {
    country: undefined,
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
    ],
    CA: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const initialContextSomeDocTypes: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: false,
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    supportedCountries: ['US', 'CA'],
    supportedCountryAndDocTypes: {
      us: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
      ],
      ca: [SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
    },
  },
  idDoc: {
    country: undefined,
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    CA: [SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
};

export const initialContextOnlyUS: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: true,
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    supportedCountries: ['US'],
    supportedCountryAndDocTypes: {
      us: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
      ],
    },
  },
  idDoc: {
    country: 'US',
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const initialContextBD: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: true,
    supportedDocumentTypes: [SupportedIdDocTypes.passport],
    supportedCountries: ['BD'],
    supportedCountryAndDocTypes: {
      bd: [SupportedIdDocTypes.passport],
    },
  },
  idDoc: {
    country: 'BD',
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    BD: [SupportedIdDocTypes.passport],
  },
};

export const initialContextNoSupportedDoc: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: true,
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    supportedCountries: ['US'],
    supportedCountryAndDocTypes: {
      us: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
      ],
    },
  },
  idDoc: {
    country: 'SG',
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const withSubmitDocTypeAndCountry = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/documents',
    statusCode: 200,
    response: {
      id: 'testID',
    },
  });
};

export const withSubmitDocTypeAndCountryError = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/documents',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
};
