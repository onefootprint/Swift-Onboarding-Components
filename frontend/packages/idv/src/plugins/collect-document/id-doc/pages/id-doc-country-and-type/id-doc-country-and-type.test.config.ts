import { mockRequest } from '@onefootprint/test-utils';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

export const initialContextAllDocTypes: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
      SupportedIdDocTypes.voterIdentification,
    ],
    CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
  documentRequestId: 'id',
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
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  idDoc: {
    country: undefined,
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
    CA: [SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
};

export const initialContextOnlyUS: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  idDoc: {
    country: 'US',
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
};

export const initialContextBD: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  documentRequestId: 'id',
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
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  idDoc: {
    country: 'SG',
    type: undefined,
  },
  supportedCountryAndDocTypes: {
    US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
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
