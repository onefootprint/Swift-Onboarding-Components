import { IdDocStatus, UploadSource } from '@onefootprint/types';
import sortDocumentsByStartedAt from './sort-documents';
import {
  documentsWithUploads,
  driversLicenseDocument1,
  driversLicenseDocument2,
  idCardDocument1,
  idCardDocument2,
  incompleteDriversLicense,
  simpleDocuments,
} from './sort-documents.test.config';

describe('sortDocuments', () => {
  it('should sort simple documents correctly', () => {
    expect(sortDocumentsByStartedAt(simpleDocuments)).toEqual([
      {
        status: IdDocStatus.complete,
        startedAt: '2020-01-27T14:43:47.444716Z',
      },
      {
        completedVersion: 1,
        uploadSource: UploadSource.Mobile,
        startedAt: '2023-03-27T14:43:47.444716Z',
      },
      {
        startedAt: '2023-10-27T14:43:47.444716Z',
      },
      {
        completedVersion: 3,
        startedAt: '2024-09-27T14:43:47.444716Z',
      },
      {},
    ]);
  });

  it('should sort documents with uploads correctly', () => {
    expect(sortDocumentsByStartedAt(documentsWithUploads)).toEqual([
      driversLicenseDocument2,
      idCardDocument2,
      incompleteDriversLicense,
      idCardDocument1,
      driversLicenseDocument1,
    ]);
  });
});
