import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';

export const documentWithCompletedVersion: Document = {
  completedVersion: 1234,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-23T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const documentWithNoCompleteVersion1: Document = {
  completedVersion: null,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-23T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
  uploadSource: UploadSource.Mobile,
};

export const documentWithNoCompleteVersion2: Document = {
  completedVersion: null,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2023-07-24T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 60,
  selfieScore: 55,
  ocrConfidenceScore: 50,
  uploadSource: UploadSource.Mobile,
};
