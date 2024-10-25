import {
  type Document,
  DocumentDI,
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
  UploadSource,
} from '@onefootprint/types';

export const idCard: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2021-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 123,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
    {
      version: 125,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardBack,
    },
    {
      version: 124,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardSelfie,
    },
  ],
  documentScore: 70,
  selfieScore: 70,
  ocrConfidenceScore: 70,
};

export const driversLicense: Document = {
  completedVersion: 787,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2024-01-04T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 450,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-08-09T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
  ],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const documents = [idCard, driversLicense] as Document[];
