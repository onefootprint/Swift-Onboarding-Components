import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

export const driversLicenseDocument1: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 50,
  uploadSource: UploadSource.Mobile,
};

export const driversLicenseDocument2: Document = {
  completedVersion: 2,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 60,
  selfieScore: 60,
  ocrConfidenceScore: 60,
  uploadSource: UploadSource.Mobile,
};

export const passportDocument1: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.passport,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 65,
  selfieScore: 65,
  ocrConfidenceScore: 65,
  uploadSource: UploadSource.Mobile,
};

export const idCardDocument1: Document = {
  completedVersion: 3,
  kind: SupportedIdDocTypes.idCard,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 70,
  selfieScore: 70,
  ocrConfidenceScore: 70,
  uploadSource: UploadSource.Mobile,
};

export const documentsFixture: Document[] = [
  driversLicenseDocument1,
  driversLicenseDocument2,
  passportDocument1,
  idCardDocument1,
];
