import getDocumentVersion from './get-document-version';
import {
  documentWithCompletedVersion,
  documentWithNoCompleteVersion1,
  documentWithNoCompleteVersion2,
} from './get-document-version.test.config';

describe('getDocumentVersion', () => {
  it('should return the completed version if it exists', () => {
    const documents = [documentWithCompletedVersion, documentWithNoCompleteVersion1, documentWithNoCompleteVersion2];
    const result = getDocumentVersion(documentWithCompletedVersion, documents);
    expect(result).toEqual('1234');
  });

  it('should return incomplete_{index} if the completed version does not exist in first index', () => {
    const documents = [documentWithCompletedVersion, documentWithNoCompleteVersion1, documentWithNoCompleteVersion2];
    const result = getDocumentVersion(documentWithNoCompleteVersion1, documents);
    expect(result).toEqual('incomplete_1');
  });

  it('should return incomplete_{index} if the completed version does not exist in other index', () => {
    const documents = [documentWithCompletedVersion, documentWithNoCompleteVersion1, documentWithNoCompleteVersion2];
    const result = getDocumentVersion(documentWithNoCompleteVersion2, documents);
    expect(result).toEqual('incomplete_2');
  });
});
