import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

export const driversLicenseSuccess: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-23T00:00:00.000Z',
  status: IdDocStatus.complete,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseFailed: Document = {
  completedVersion: 2,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-24T00:00:00.000Z',
  status: IdDocStatus.failed,
  uploads: [],
  documentScore: 55,
  selfieScore: null,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseViaApi: Document = {
  completedVersion: 2,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: undefined,
  status: undefined,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
};

export const driversLicensePending: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-25T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const idCardSuccess: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2023-07-26T00:00:00.000Z',
  status: IdDocStatus.complete,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
};

export const idCardFail: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2023-07-27T00:00:00.000Z',
  status: IdDocStatus.failed,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
};
