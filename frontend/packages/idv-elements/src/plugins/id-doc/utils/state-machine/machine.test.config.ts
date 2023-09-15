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
  onlyUsSupported: false,
  supportedDocumentTypes: [
    SupportedIdDocTypes.driversLicense,
    SupportedIdDocTypes.idCard,
    SupportedIdDocTypes.passport,
  ],
  supportedCountries: ['US', 'CA'],
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
  },
  currSide: IdDocImageTypes.front,
  requirement: { ...requirement },
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

export const argsRegularDesktop: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'desktop',
  },
  currSide: IdDocImageTypes.front,
  requirement: { ...requirement },
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

export const processingErrors = [
  { errorType: IdDocImageProcessingError.countryCodeMismatch },
  { errorType: IdDocImageProcessingError.wrongDocumentSide },
];
export const uploadErrors = [
  { errorType: IdDocImageUploadError.fileTypeNotAllowed },
];
