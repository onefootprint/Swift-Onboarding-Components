import {
  type Document,
  DocumentDI,
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
  UploadSource,
} from '@onefootprint/types';

export const idCardDocument1: Document = {
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

export const idCardDocument2: Document = {
  completedVersion: 5,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-07-19T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 260,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2023-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardBack,
    },
  ],
  documentScore: 70,
  selfieScore: 70,
  ocrConfidenceScore: 70,
};

export const driversLicenseDocument1: Document = {
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
    {
      version: 460,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-02-11T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
    {
      version: 470,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2020-01-22T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseSelfie,
    },
  ],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const driversLicenseDocument2: Document = {
  completedVersion: 1738,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2018-01-30T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 789,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2022-01-05T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
    {
      version: 790,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2009-11-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
    {
      version: 791,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2011-04-24T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseSelfie,
    },
  ],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const incompleteDriversLicense: Document = {
  completedVersion: null,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-08-29T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 790,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2019-01-12T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
    {
      version: 789,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2024-08-11T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
  ],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const documentsWithUploads = [
  idCardDocument1,
  idCardDocument2,
  driversLicenseDocument1,
  driversLicenseDocument2,
  incompleteDriversLicense,
] as Document[];

export const simpleDocuments = documentsWithUploads.map(document => ({ ...document, uploads: [] }));
