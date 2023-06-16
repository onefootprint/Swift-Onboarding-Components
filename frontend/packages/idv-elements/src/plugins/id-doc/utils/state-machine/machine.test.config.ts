import {
  IdDocImageError,
  IdDocRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';

import { ImageTypes } from '../../constants/image-types';
import { MachineContext } from './types';

export const requirement: IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc,
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  onlyUsSupported: false,
  supportedDocumentTypes: [
    SupportedIdDocTypes.driversLicense,
    SupportedIdDocTypes.idCard,
    SupportedIdDocTypes.passport,
  ],
};

export const argsRegular: MachineContext = {
  authToken: 'token',
  device: {
    hasSupportForWebauthn: true,
    type: 'mobile',
  },
  currSide: ImageTypes.front,
  requirement: { ...requirement },
  idDoc: {},
};

export const argsNonMobile: MachineContext = {
  ...argsRegular,
  device: {
    hasSupportForWebauthn: true,
    type: 'quantum computer',
  },
};

export const argsUsOnlySingleDocType: MachineContext = {
  ...argsRegular,
  requirement: {
    ...requirement,
    onlyUsSupported: true,
    supportedDocumentTypes: [SupportedIdDocTypes.driversLicense],
  },
};

export const processingErrors = [IdDocImageError.documentNotReadable];
