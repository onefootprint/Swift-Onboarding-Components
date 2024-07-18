import { IdDocImageProcessingError, IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

const contextWithSelfieErrors: MachineContext = {
  authToken: 'token',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  currSide: IdDocImageTypes.front,
  orgId: 'orgId',
  shouldCollectSelfie: true,
  isConsentMissing: true,
  uploadMode: 'default',
  documentRequestId: 'id',
  errors: [{ errorType: IdDocImageProcessingError.selfieGlare }],
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
    CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
  },
};

export default contextWithSelfieErrors;
