import { DocumentDI, type DocumentUpload, IdDocImageProcessingError, IdDocImageTypes } from '@onefootprint/types';

export const sameIdentifierUploads: DocumentUpload[] = [
  {
    version: 1,
    failureReasons: [],
    side: IdDocImageTypes.front,
    timestamp: '2020-01-01T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestIdCardFront,
  },
  {
    version: 2,
    failureReasons: [],
    side: IdDocImageTypes.front,
    timestamp: '2020-01-02T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestIdCardFront,
  },
  {
    version: 5,
    failureReasons: [IdDocImageProcessingError.documentGlare],
    side: IdDocImageTypes.front,
    timestamp: '2020-01-03T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestIdCardFront,
  },
];

export const differentIdentifierUploads: DocumentUpload[] = [
  ...sameIdentifierUploads,
  {
    version: 125,
    failureReasons: [],
    side: IdDocImageTypes.back,
    timestamp: '2020-01-01T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestIdCardBack,
  },
  {
    version: 10,
    failureReasons: [],
    side: IdDocImageTypes.selfie,
    timestamp: '2020-01-01T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestIdCardSelfie,
  },
  {
    version: 7,
    failureReasons: [],
    side: IdDocImageTypes.front,
    timestamp: '2020-09-09T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestDriversLicenseFront,
  },
  {
    version: 1,
    failureReasons: [IdDocImageProcessingError.countryCodeMismatch],
    side: IdDocImageTypes.front,
    timestamp: '2020-08-09T00:00:00.000Z',
    isExtraCompressed: false,
    identifier: DocumentDI.latestDriversLicenseFront,
  },
];
