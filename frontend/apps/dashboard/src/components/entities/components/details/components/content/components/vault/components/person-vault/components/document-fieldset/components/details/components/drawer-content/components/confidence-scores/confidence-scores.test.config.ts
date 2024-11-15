import { type Document, IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

const documentFixture: Omit<Document, 'uploads'> = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const documentWithTwoScores: Omit<Document, 'uploads'> = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  documentScore: 55,
  ocrConfidenceScore: 45,
  selfieScore: null,
  uploadSource: UploadSource.Mobile,
};

export const documentWithOneScore: Omit<Document, 'uploads'> = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  ocrConfidenceScore: 45,
  documentScore: null,
  selfieScore: null,
  uploadSource: UploadSource.Mobile,
};

export const documentWithNoScores: Omit<Document, 'uploads'> = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploadSource: UploadSource.Mobile,
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const documentWithZeroScores: Omit<Document, 'uploads'> = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  documentScore: 0,
  selfieScore: 0,
  ocrConfidenceScore: 0,
  uploadSource: UploadSource.Mobile,
};

export default documentFixture;
