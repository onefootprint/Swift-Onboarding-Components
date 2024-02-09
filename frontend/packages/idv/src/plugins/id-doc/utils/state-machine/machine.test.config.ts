import type { IdDocRequirement } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';

import type { MachineContext } from './types';

export const requirement: IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc,
  isMet: false,
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  supportedCountryAndDocTypes: {
    us: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    ca: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const argsRegularMobile: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
    osName: 'iOS',
  },
  currSide: IdDocImageTypes.front,
  requirement: JSON.parse(JSON.stringify(requirement)),
  idDoc: {},
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    CA: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const getArgsRegularMobile = () =>
  JSON.parse(JSON.stringify(argsRegularMobile));

export const argsRegularDesktop: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'desktop',
    osName: 'Windows',
  },
  currSide: IdDocImageTypes.front,
  requirement: JSON.parse(JSON.stringify(requirement)),
  idDoc: {},
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
    CA: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const getArgsRegularDesktop = () =>
  JSON.parse(JSON.stringify(argsRegularDesktop));

export const processingErrors = [
  { errorType: IdDocImageProcessingError.countryCodeMismatch },
  { errorType: IdDocImageProcessingError.wrongDocumentSide },
];
export const uploadErrors = [
  { errorType: IdDocImageUploadError.fileTypeNotAllowed },
];

export const testFile = new File(['foo'], 'foo.txt', {
  type: 'text/plain',
});
