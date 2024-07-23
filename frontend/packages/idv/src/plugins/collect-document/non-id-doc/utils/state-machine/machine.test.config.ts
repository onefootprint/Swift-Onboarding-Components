import { DocumentRequestKind, IdDocImageProcessingError, IdDocImageUploadError } from '@onefootprint/types';

import type { MachineContext } from './types';

export const argsRegularMobile: MachineContext = {
  authToken: 'token',
  cameraPermissionState: 'prompt',
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  orgId: 'orgId',
  uploadMode: 'default',
  documentRequestId: 'id',
  config: {
    kind: DocumentRequestKind.ProofOfAddress,
  },
};

export const getArgsRegularMobile = (overrides?: Partial<MachineContext>) =>
  JSON.parse(JSON.stringify({ ...argsRegularMobile, ...overrides }));

export const argsRegularDesktop: MachineContext = {
  authToken: 'token',
  cameraPermissionState: 'prompt',
  device: {
    hasSupportForWebauthn: true,
    type: 'desktop',
    osName: 'Windows',
    browser: 'Chrome',
  },
  orgId: 'orgId',
  uploadMode: 'default',
  documentRequestId: 'id',
  config: {
    kind: DocumentRequestKind.ProofOfAddress,
  },
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
