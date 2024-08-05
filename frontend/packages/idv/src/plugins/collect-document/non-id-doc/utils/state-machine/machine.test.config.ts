import {
  DocumentRequestKind,
  DocumentRequirement,
  DocumentUploadSettings,
  IdDocImageProcessingError,
  IdDocImageUploadError,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { MachineContext } from './types';

const documentRequirement: DocumentRequirement = {
  kind: OnboardingRequirementKind.document,
  isMet: false,
  documentRequestId: 'id',
  uploadSettings: DocumentUploadSettings.preferCapture,
  config: {
    kind: DocumentRequestKind.ProofOfAddress,
  },
};

export const argsRegularMobile: MachineContext = {
  authToken: 'token',
  cameraPermissionState: 'prompt',
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  requirement: documentRequirement,
  orgId: 'orgId',
};

export const getArgsRegularMobile = (overrides?: Partial<MachineContext>) =>
  JSON.parse(JSON.stringify({ ...argsRegularMobile, ...overrides }));

export const argsRegularDesktop: MachineContext = {
  ...argsRegularMobile,
  device: {
    hasSupportForWebauthn: true,
    type: 'desktop',
    osName: 'Windows',
    browser: 'Chrome',
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
