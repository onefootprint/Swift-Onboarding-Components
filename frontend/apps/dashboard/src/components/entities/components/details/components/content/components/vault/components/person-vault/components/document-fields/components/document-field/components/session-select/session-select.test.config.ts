import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

export const driversLicenseDoc1: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-23T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseDoc2: Document = {
  completedVersion: 2,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-24T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: null,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseDoc3: Document = {
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

export const driversLicenseDoc4: Document = {
  completedVersion: 4,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-26T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseViaApi: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: undefined,
  status: undefined,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
  uploadSource: UploadSource.Mobile,
};
