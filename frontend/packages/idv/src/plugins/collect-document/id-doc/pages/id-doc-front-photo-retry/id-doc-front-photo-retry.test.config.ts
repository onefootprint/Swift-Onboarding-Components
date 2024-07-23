import {
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';

const contextWithErrors: MachineContext = {
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
  errors: [
    { errorType: IdDocImageProcessingError.countryCodeMismatch },
    { errorType: IdDocImageProcessingError.wrongDocumentSide },
    { errorType: IdDocImageUploadError.fileTypeNotAllowed },
  ],
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
  cameraPermissionState: 'prompt',
};

export default contextWithErrors;
