import { IdDocImageProcessingError } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types/src/data/di';
import { IdDocImageTypes } from '@onefootprint/types/src/data/id-doc-type';
import sortDocumentsAndUploads from './sort-documents';
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
    expect(sortDocumentsAndUploads(simpleDocuments)).toEqual([
      {
        ...driversLicenseDocument1,
        uploads: [],
      },
      {
        ...idCardDocument1,
        uploads: [],
      },
      {
        ...incompleteDriversLicense,
        uploads: [],
      },
      {
        ...idCardDocument2,
        uploads: [],
      },
      {
        ...driversLicenseDocument2,
        uploads: [],
      },
    ]);
  });

  it('should sort documents with uploads correctly', () => {
    expect(sortDocumentsAndUploads(documentsWithUploads)).toEqual([
      {
        ...driversLicenseDocument1,
        uploads: [
          {
            version: 450,
            failureReasons: [],
            side: IdDocImageTypes.front,
            timestamp: '2020-08-09T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseFront,
          },
          {
            version: 460,
            failureReasons: [],
            side: IdDocImageTypes.back,
            timestamp: '2020-02-11T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseBack,
          },
          {
            version: 470,
            failureReasons: [],
            side: IdDocImageTypes.selfie,
            timestamp: '2020-01-22T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseSelfie,
          },
        ],
      },
      {
        ...idCardDocument1,
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
      },
      {
        ...incompleteDriversLicense,
        uploads: [
          {
            version: 789,
            failureReasons: [],
            side: IdDocImageTypes.front,
            timestamp: '2024-08-11T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseFront,
          },
          {
            version: 790,
            failureReasons: [],
            side: IdDocImageTypes.back,
            timestamp: '2019-01-12T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseBack,
          },
        ],
      },
      idCardDocument2,
      {
        ...driversLicenseDocument2,
        uploads: [
          {
            version: 791,
            failureReasons: [],
            side: IdDocImageTypes.selfie,
            timestamp: '2011-04-24T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseSelfie,
          },
          {
            version: 789,
            failureReasons: [IdDocImageProcessingError.documentSharpness, IdDocImageProcessingError.unknownError],
            side: IdDocImageTypes.front,
            timestamp: '2022-01-05T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseFront,
          },
          {
            version: 790,
            failureReasons: [IdDocImageProcessingError.unableToAlignDocument],
            side: IdDocImageTypes.back,
            timestamp: '2009-11-01T00:00:00.000Z',
            isExtraCompressed: false,
            identifier: DocumentDI.latestDriversLicenseBack,
          },
        ],
      },
    ]);
  });
});
