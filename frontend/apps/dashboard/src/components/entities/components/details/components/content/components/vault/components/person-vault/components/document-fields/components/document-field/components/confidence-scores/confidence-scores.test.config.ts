import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes } from '@onefootprint/types';

const documentFixture: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: 50,
  ocrConfidenceScore: 45,
};

export const documentWithTwoScores: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 55,
  selfieScore: null,
  ocrConfidenceScore: 45,
};

export const documentWithOneScore: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: 45,
};

export const documentWithNoScores: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: null,
  selfieScore: null,
  ocrConfidenceScore: null,
};

export const documentWithZeroScores: Document = {
  completedVersion: 1,
  kind: SupportedIdDocTypes.driversLicense,
  startedAt: '2020-01-01T00:00:00.000Z',
  status: IdDocStatus.pending,
  uploads: [],
  documentScore: 0,
  selfieScore: 0,
  ocrConfidenceScore: 0,
};

export default documentFixture;
