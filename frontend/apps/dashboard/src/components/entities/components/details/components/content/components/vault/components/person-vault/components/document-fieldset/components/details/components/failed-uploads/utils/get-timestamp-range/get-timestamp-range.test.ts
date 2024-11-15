import { DocumentDI, type DocumentUpload, IdDocImageTypes } from '@onefootprint/types';
import getTimestampRange from './get-timestamp-range';

const createUpload = (timestamp: string): DocumentUpload => ({
  version: 1,
  failureReasons: [],
  side: IdDocImageTypes.front,
  timestamp,
  isExtraCompressed: false,
  identifier: DocumentDI.latestPassport,
});

describe('getTimestampRange', () => {
  it('should format uploads on same day with same time correctly', () => {
    const uploads: DocumentUpload[] = [
      createUpload('2024-03-14T10:30:00Z'),
      createUpload('2024-03-14T10:30:00Z'),
      createUpload('2024-03-14T10:30:00Z'),
    ];
    expect(getTimestampRange(uploads)).toBe('03/14/24 10:30AM');
  });

  it('should format multiple uploads on same day with different times correctly', () => {
    const uploads: DocumentUpload[] = [
      createUpload('2024-03-14T10:40:00Z'),
      createUpload('2024-03-14T10:30:00Z'),
      createUpload('2024-03-14T14:45:00Z'),
    ];
    expect(getTimestampRange(uploads)).toBe('03/14/24 10:30AM - 2:45PM');
  });

  it('should format uploads on different days correctly', () => {
    const uploads: DocumentUpload[] = [
      createUpload('2024-03-15T14:45:00Z'),
      createUpload('2024-03-14T10:30:00Z'),
      createUpload('2024-03-16T10:30:00Z'),
    ];
    expect(getTimestampRange(uploads)).toBe('03/14/24 10:30AM - 03/16/24 10:30AM');
  });
});
