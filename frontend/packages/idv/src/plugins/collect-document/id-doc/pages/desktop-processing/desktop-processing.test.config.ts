import { mockRequest } from '@onefootprint/test-utils';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL as baseInitialContextDL } from '../../utils/state-machine/machine.test.config';

export const initialContextDL: MachineContext = {
  ...baseInitialContextDL,
  id: 'testID',
  image: {
    imageFile: new File(['foo'], 'foo.txt', {
      type: 'text/plain',
    }),
    captureKind: 'manual',
    extraCompressed: false,
    forcedUpload: false,
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
