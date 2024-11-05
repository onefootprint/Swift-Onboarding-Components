import { DocumentDI, IdDocImageProcessingError, IdDocImageTypes } from '@onefootprint/types';
import transformUploadsWithIsLatest from './transform-uploads-with-is-latest';
import { differentIdentifierUploads, sameIdentifierUploads } from './transform-uploads-with-is-latest.test.config';

describe('transformUploadsWithIsLatest', () => {
  it('should add the correct isLatest value to each upload when all uploads have the same identifier', () => {
    expect(transformUploadsWithIsLatest([])).toEqual([]);
    expect(transformUploadsWithIsLatest(sameIdentifierUploads)).toEqual([
      {
        version: 1,
        failureReasons: [],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-01T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: false,
      },
      {
        version: 2,
        failureReasons: [],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-02T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: false,
      },
      {
        version: 5,
        failureReasons: [IdDocImageProcessingError.documentGlare],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-03T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: true,
      },
    ]);
  });

  it('should add the correct isLatest value to each upload when there are multiple identifiers', () => {
    expect(transformUploadsWithIsLatest(differentIdentifierUploads)).toEqual([
      {
        version: 1,
        failureReasons: [],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-01T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: false,
      },
      {
        version: 2,
        failureReasons: [],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-02T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: false,
      },
      {
        version: 5,
        failureReasons: [IdDocImageProcessingError.documentGlare],
        side: IdDocImageTypes.front,
        timestamp: '2020-01-03T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardFront,
        isLatest: true,
      },
      {
        version: 125,
        failureReasons: [],
        side: IdDocImageTypes.back,
        timestamp: '2020-01-01T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardBack,
        isLatest: true,
      },
      {
        version: 10,
        failureReasons: [],
        side: IdDocImageTypes.selfie,
        timestamp: '2020-01-01T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestIdCardSelfie,
        isLatest: true,
      },
      {
        version: 7,
        failureReasons: [],
        side: IdDocImageTypes.front,
        timestamp: '2020-09-09T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseFront,
        isLatest: true,
      },
      {
        version: 1,
        failureReasons: [IdDocImageProcessingError.countryCodeMismatch],
        side: IdDocImageTypes.front,
        timestamp: '2020-08-09T00:00:00.000Z',
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseFront,
        isLatest: false,
      },
    ]);
  });
});
