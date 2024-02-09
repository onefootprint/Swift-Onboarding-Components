import {
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

export const initialContextDL: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    uploadMode: 'default',
    supportedCountryAndDocTypes: {
      us: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.visa,
        SupportedIdDocTypes.workPermit,
      ],
      ca: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
      ],
    },
  },
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.driversLicense,
  },
  supportedCountryAndDocTypes: {
    US: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
    ],
    CA: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
    ],
  },
};

export const initialContextWithErrors: MachineContext = {
  ...initialContextDL,
  errors: [
    { errorType: IdDocImageProcessingError.countryCodeMismatch },
    { errorType: IdDocImageProcessingError.wrongDocumentSide },
    { errorType: IdDocImageUploadError.fileTypeNotAllowed },
  ],
};

export const initialContextBD: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'BD',
    type: SupportedIdDocTypes.passport,
  },
};

export const initialContextPassport: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.passport,
  },
};

export const initialContextIdCard: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.idCard,
  },
};

export const initialContextWorkPermit: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.workPermit,
  },
};

export const initialContextVisa: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.visa,
  },
};

export const initialContextGreenCard: MachineContext = {
  ...initialContextDL,
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.residenceDocument,
  },
};
