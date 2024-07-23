import { IdDocImageProcessingError, IdDocImageTypes, IdDocImageUploadError } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';

import type { MachineContext } from './types';

export const argsRegularMobile: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  isConsentMissing: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  idDoc: {},
  supportedCountryAndDocTypes: {
    US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
    CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
  cameraPermissionState: 'prompt',
};

export const getArgsRegularMobile = (override?: Partial<MachineContext>) =>
  JSON.parse(JSON.stringify({ ...argsRegularMobile, ...override }));

export const argsRegularDesktop: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'desktop',
    osName: 'Windows',
    browser: 'Chrome',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  isConsentMissing: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  idDoc: {},
  supportedCountryAndDocTypes: {
    US: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
    CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
  cameraPermissionState: 'prompt',
};

export const getArgsRegularDesktop = () => JSON.parse(JSON.stringify(argsRegularDesktop));

export const processingErrors = [
  { errorType: IdDocImageProcessingError.countryCodeMismatch },
  { errorType: IdDocImageProcessingError.wrongDocumentSide },
];
export const uploadErrors = [{ errorType: IdDocImageUploadError.fileTypeNotAllowed }];

export const testFile = new File(['foo'], 'foo.txt', {
  type: 'text/plain',
});
