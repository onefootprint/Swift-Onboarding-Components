import { mockRequest } from '@onefootprint/test-utils';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

export const initialContextDL: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  documentRequestId: 'id',
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.driversLicense,
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
    CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
  id: 'testID',
  image: {
    imageFile: new File(['foo'], 'foo.txt', {
      type: 'text/plain',
    }),
    captureKind: 'manual',
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

export const withSubmitDocFront = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/documents/testID/upload/front',
    statusCode: 200,
    response: {
      errors: [],
      nextSideToCollect: null,
      isRetryLimitExceeded: false,
    },
  });
};

export const withSubmitDocBack = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/documents/testID/upload/back',
    statusCode: 200,
    response: {
      errors: [],
      nextSideToCollect: null,
      isRetryLimitExceeded: false,
    },
  });
};

export const withSubmitDocSelfie = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/documents/testID/upload/selfie',
    statusCode: 200,
    response: {
      errors: [],
      nextSideToCollect: null,
      isRetryLimitExceeded: false,
    },
  });
};
