import type { Document, EntityVault } from '@onefootprint/types';
import { DocumentDI, IdDocImageTypes, IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

export const entityVaultWithJustIDCardDIs: EntityVault = {
  [DocumentDI.latestIdCardFront]: '',
  [DocumentDI.latestIdCardBack]: '',
  [DocumentDI.latestIdCardSelfie]: '',
  [DocumentDI.idCardFullName]: '',
  [DocumentDI.idCardDOB]: '',
  [DocumentDI.idCardGender]: '',
  [DocumentDI.idCardFullAddress]: '',
  [DocumentDI.idCardDocumentNumber]: '',
  [DocumentDI.idCardIssuedAt]: '',
  [DocumentDI.idCardExpiresAt]: '',
  [DocumentDI.idCardIssuingState]: '',
  [DocumentDI.idCardIssuingCountry]: '',
  [DocumentDI.idCardRefNumber]: '',
};

export const entityVaultWithIDCardAndDriversLicenseDIs: EntityVault = {
  ...entityVaultWithJustIDCardDIs,
  [DocumentDI.latestDriversLicenseFront]: '',
  [DocumentDI.latestDriversLicenseBack]: '',
  [DocumentDI.latestDriversLicenseSelfie]: '',
  [DocumentDI.driversLicenseFullName]: '',
  [DocumentDI.driversLicenseDOB]: '',
  [DocumentDI.driversLicenseGender]: '',
  [DocumentDI.driversLicenseFullAddress]: '',
  [DocumentDI.driversLicenseDocumentNumber]: '',
  [DocumentDI.driversLicenseIssuedAt]: '',
  [DocumentDI.driversLicenseExpiresAt]: '',
  [DocumentDI.driversLicenseIssuingState]: '',
  [DocumentDI.driversLicenseIssuingCountry]: '',
  [DocumentDI.driversLicenseRefNumber]: '',
};

export const idCardDocument1: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
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
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 250,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
    {
      version: 260,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardBack,
    },
    {
      version: 270,
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

export const driversLicenseDocument1: Document = {
  completedVersion: 787,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 450,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
    {
      version: 460,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
    {
      version: 470,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2020-01-01T00:00:00.000Z',
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
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 789,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
    {
      version: 790,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
    {
      version: 791,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2020-01-01T00:00:00.000Z',
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
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 789,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseFront,
    },
    {
      version: 790,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2020-01-01T00:00:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestDriversLicenseBack,
    },
  ],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const idCardDocuments = [idCardDocument1, idCardDocument2];
