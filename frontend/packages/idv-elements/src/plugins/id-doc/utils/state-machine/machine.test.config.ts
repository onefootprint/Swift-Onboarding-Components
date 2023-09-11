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
};

export const processingErrors = [IdDocImageProcessingError.documentNotReadable];
export const uploadErrors = [IdDocImageUploadError.fileTypeNotAllowed];
