import { mockRequest } from '@onefootprint/test-utils';
import {
  IdDocImageTypes,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

export const initialContextDL: MachineContext = {
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
    country: 'US',
    type: SupportedIdDocTypes.driversLicense,
  },
  id: 'testID',
  image: {
    imageString: 'image',
    mimeType: 'image/png',
  },
};

export const initialContextBD: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'BD',
    type: SupportedIdDocTypes.passport,
  },
};

export const initialContextPassport: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.passport,
  },
};

export const initialContextIdCard: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.idCard,
  },
};

export const initialContextWorkPermit: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.workPermit,
  },
};

export const initialContextVisa: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.visa,
  },
};

export const initialContextGreenCard: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.residenceDocument,
  },
};

export const initialContextDLBack: MachineContext = {
  ...initialContextDL,
  currSide: IdDocImageTypes.back,
};

export const initialContextDLSelfie: MachineContext = {
  ...initialContextDL,
  currSide: IdDocImageTypes.selfie,
};

export const withSubmitDoc = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/documents/testID/upload',
    statusCode: 200,
    response: {
      errors: [],
      nextSideToCollect: null,
      isRetryLimitExceeded: false,
    },
  });
};
