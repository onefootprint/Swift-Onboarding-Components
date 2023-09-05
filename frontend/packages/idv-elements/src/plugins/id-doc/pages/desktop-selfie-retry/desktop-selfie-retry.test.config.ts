import {
  IdDocImageProcessingError,
  IdDocImageTypes,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import { MachineContext } from '../../utils/state-machine';

const initialContextWithErrors: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
  },
  currSide: IdDocImageTypes.front,
  requirement: {
    isMet: false,
    kind: OnboardingRequirementKind.idDoc,
    shouldCollectSelfie: true,
    shouldCollectConsent: true,
    onlyUsSupported: false,
    supportedDocumentTypes: [
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.workPermit,
    ],

    supportedCountries: ['US', 'CA'],
  },
  errors: [IdDocImageProcessingError.selfieGlare],
  idDoc: {
    country: 'US',
    type: SupportedIdDocTypes.driversLicense,
  },
};

export default initialContextWithErrors;
