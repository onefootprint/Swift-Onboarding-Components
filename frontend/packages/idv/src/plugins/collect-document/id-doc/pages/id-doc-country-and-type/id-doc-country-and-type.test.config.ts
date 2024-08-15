import { mockRequest } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';

export const initialContextAllDocTypes: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: undefined,
    type: undefined,
  },
};

export const initialContextSomeDocTypes: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: undefined,
    type: undefined,
  },
  requirement: {
    ...initialContextDL.requirement,
    config: {
      ...initialContextDL.requirement.config,
      supportedCountryAndDocTypes: {
        US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
        CA: [SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
      },
    },
  },
};

export const initialContextOnlyUS: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: undefined,
  },
  requirement: {
    ...initialContextDL.requirement,
    config: {
      ...initialContextDL.requirement.config,
      supportedCountryAndDocTypes: {
        US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
      },
    },
  },
};

export const initialContextBD: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'BD',
    type: undefined,
  },
  requirement: {
    ...initialContextDL.requirement,
    config: {
      ...initialContextDL.requirement.config,
      supportedCountryAndDocTypes: {
        BD: [SupportedIdDocTypes.passport],
      },
    },
  },
};

export const initialContextNoSupportedDoc: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'SG',
    type: undefined,
  },
  requirement: {
    ...initialContextDL.requirement,
    config: {
      ...initialContextDL.requirement.config,
      supportedCountryAndDocTypes: {
        BD: [SupportedIdDocTypes.passport],
        US: [],
      },
    },
  },
};

export const withSubmitDocTypeAndCountry = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/documents',
    statusCode: 200,
    response: {
      id: 'testID',
    },
  });
};

export const withSubmitDocTypeAndCountryError = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/documents',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};
