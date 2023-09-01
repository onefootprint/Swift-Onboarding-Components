import { mockRequest } from '@onefootprint/test-utils';
import {
  IdDocImageTypes,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import { MachineContext } from '../../utils/state-machine';

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
  },
  idDoc: {
    country: undefined,
    type: undefined,
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
  },
  idDoc: {
    country: undefined,
    type: undefined,
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
  },
  idDoc: {
    country: 'US',
    type: undefined,
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
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    supportedCountries: ['US'],
  },
  idDoc: {
    country: 'BD',
    type: undefined,
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
  },
  idDoc: {
    country: 'SG',
    type: undefined,
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
