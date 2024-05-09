import type { Document } from '@onefootprint/types';
import { IdDocStatus, SupportedIdDocTypes } from '@onefootprint/types';
import { DocumentReviewStatus } from '@onefootprint/types/src/data/document-type';

import getDocumentStatus, {
  computeSingleDocumentStatus,
  DocumentStatus,
} from './get-document-status';
import {
  driversLicenseFailed,
  driversLicensePending,
  driversLicenseSuccess,
  driversLicenseViaApi,
  idCardFail,
  idCardSuccess,
} from './get-document-status.test.config';

describe('computeSingleDocumentStatus', () => {
  it.each([
    {
      status: IdDocStatus.failed,
      reviewStatus: DocumentReviewStatus.Unreviewed,
      x: DocumentStatus.UploadFailed,
    },
    {
      status: IdDocStatus.pending,
      reviewStatus: DocumentReviewStatus.Unreviewed,
      x: DocumentStatus.UploadIncomplete,
    },
    // This case doesn't actually happen in prod
    {
      status: IdDocStatus.complete,
      reviewStatus: DocumentReviewStatus.Unreviewed,
      x: DocumentStatus.UploadIncomplete,
    },
    {
      status: IdDocStatus.complete,
      reviewStatus: DocumentReviewStatus.PendingHumanReview,
      x: DocumentStatus.PendingHumanReview,
    },
    {
      status: IdDocStatus.complete,
      reviewStatus: DocumentReviewStatus.ReviewedByHuman,
      x: DocumentStatus.ReviewedByHuman,
    },
    {
      status: IdDocStatus.complete,
      reviewStatus: DocumentReviewStatus.PendingMachineReview,
      x: DocumentStatus.PendingMachineReview,
    },
    {
      status: IdDocStatus.complete,
      reviewStatus: DocumentReviewStatus.ReviewedByMachine,
      x: DocumentStatus.ReviewedByMachine,
    },
    {
      status: null,
      reviewStatus: null,
      x: DocumentStatus.UploadedViaApi,
    },
  ])('.', ({ status, reviewStatus, x }) => {
    const document = {
      status,
      reviewStatus,
    } as Document;
    expect(computeSingleDocumentStatus(document)).toBe(x);
  });
});

describe('getDocumentStatus', () => {
  it('should return pending if pending is the most recent', () => {
    const documents = [
      driversLicenseSuccess,
      driversLicenseFailed,
      driversLicensePending,
      idCardSuccess,
      idCardFail,
    ];
    expect(
      getDocumentStatus({
        documents,
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(DocumentStatus.UploadIncomplete);
  });

  it('should ignore document of another kind', () => {
    const documents = [driversLicenseFailed, idCardSuccess, idCardFail];
    expect(
      getDocumentStatus({
        documents,
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(DocumentStatus.UploadFailed);
  });

  it('should return undefined if there are no documents', () => {
    expect(
      getDocumentStatus({
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(null);
  });

  it('should return uploaded via API if all documents have undefined status', () => {
    expect(
      getDocumentStatus({
        documents: [driversLicenseViaApi],
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(DocumentStatus.UploadedViaApi);
  });

  it('should return undefined if is no document type', () => {
    const documents = [
      driversLicenseFailed,
      driversLicensePending,
      idCardSuccess,
      idCardFail,
    ];
    expect(
      getDocumentStatus({
        documents,
      }),
    ).toEqual(null);
  });
});
