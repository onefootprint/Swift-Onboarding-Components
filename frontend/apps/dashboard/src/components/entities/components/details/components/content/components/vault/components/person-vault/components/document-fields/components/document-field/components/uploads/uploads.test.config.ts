import type { Document, EntityVault } from '@onefootprint/types';
import {
  DocumentDI,
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
  UploadSource,
} from '@onefootprint/types';

export const entityVaultWithIdCard: EntityVault = {
  [`${DocumentDI.latestIdCardFront}:675`]: 'test ID front URL',
  [`${DocumentDI.latestIdCardBack}:676`]: 'test ID back URL',
  [`${DocumentDI.latestIdCardSelfie}:677`]: 'test ID selfie URL',
};

export const idCardMobile: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.complete,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 675,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2022-05-06T06:12:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
  ],
};

export const idCardDesktop: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.complete,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Desktop,
  uploads: [
    {
      version: 675,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2022-05-06T06:12:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
  ],
};

export const idCardApi: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.complete,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Api,
  uploads: [
    {
      version: 675,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2022-05-06T06:12:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
  ],
};

export const successfulIDCardDocument: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.complete,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 675,
      failureReasons: [],
      side: IdDocImageTypes.front,
      timestamp: '2022-05-06T06:12:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
    {
      version: 676,
      failureReasons: [],
      side: IdDocImageTypes.back,
      timestamp: '2022-05-08T03:16:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardBack,
    },
    {
      version: 677,
      failureReasons: [],
      side: IdDocImageTypes.selfie,
      timestamp: '2022-05-09T05:27:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardSelfie,
    },
  ],
};

export const failedIdCardDocument: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.complete,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
  uploads: [
    {
      version: 675,
      failureReasons: ['reason'],
      side: IdDocImageTypes.front,
      timestamp: '2022-05-06T06:12:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardFront,
    },
    {
      version: 676,
      failureReasons: ['reason'],
      side: IdDocImageTypes.back,
      timestamp: '2022-05-08T03:16:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardBack,
    },
    {
      version: 677,
      failureReasons: ['reason'],
      side: IdDocImageTypes.selfie,
      timestamp: '2022-05-09T05:27:00.000Z',
      isExtraCompressed: false,
      identifier: DocumentDI.latestIdCardSelfie,
    },
  ],
};
