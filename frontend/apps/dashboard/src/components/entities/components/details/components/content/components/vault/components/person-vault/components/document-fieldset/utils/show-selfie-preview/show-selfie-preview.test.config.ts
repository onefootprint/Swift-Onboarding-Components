import { DocumentDI, IdDocImageTypes } from '@onefootprint/types';

const frontUpload = {
  version: 123,
  failureReasons: [],
  side: IdDocImageTypes.front,
  timestamp: '2020-01-01T00:00:00.000Z',
  isExtraCompressed: false,
  identifier: DocumentDI.latestIdCardFront,
};

const failedFrontUpload = {
  ...frontUpload,
  failureReasons: ['blurry_image'],
};

const backUpload = {
  version: 125,
  failureReasons: [],
  side: IdDocImageTypes.back,
  timestamp: '2020-01-01T00:00:00.000Z',
  isExtraCompressed: false,
  identifier: DocumentDI.latestIdCardBack,
};

const selfieUpload = {
  version: 124,
  failureReasons: [],
  side: IdDocImageTypes.selfie,
  timestamp: '2020-01-01T00:00:00.000Z',
  isExtraCompressed: false,
  identifier: DocumentDI.latestIdCardSelfie,
};

const failedSelfieUpload = {
  ...selfieUpload,
  failureReasons: ['face_not_visible', 'blurry_image'],
};

export const uploadsWithNoSelfies = [frontUpload, failedFrontUpload, backUpload];
export const uploadsWithSuccessfulSelfies = [frontUpload, failedFrontUpload, selfieUpload];
export const uploadsWithFailedSelfie = [frontUpload, backUpload, failedSelfieUpload];
