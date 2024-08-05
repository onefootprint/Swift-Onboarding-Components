import {
  DocumentRequestKind,
  DocumentRequirement,
  DocumentUploadSettings,
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  IdDocRequirementConfig,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';

import type { MachineContext } from './types';

const documentRequirement: DocumentRequirement<IdDocRequirementConfig> = {
  kind: OnboardingRequirementKind.document,
  isMet: false,
  documentRequestId: 'id',
  uploadSettings: DocumentUploadSettings.preferCapture,
  config: {
    kind: DocumentRequestKind.Identity,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
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
  },
};

export const initialContextDL: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  requirement: documentRequirement,
  isConsentMissing: true,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.driversLicense,
  },
  cameraPermissionState: 'prompt',
};

export const argsRegularMobile: MachineContext = {
  ...initialContextDL,
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
};

export const getArgsRegularMobile = (override?: Partial<MachineContext>) =>
  JSON.parse(JSON.stringify({ ...argsRegularMobile, ...override }));

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
