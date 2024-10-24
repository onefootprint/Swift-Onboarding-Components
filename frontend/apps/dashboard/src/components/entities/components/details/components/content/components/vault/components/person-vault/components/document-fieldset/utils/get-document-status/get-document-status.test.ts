import getDocumentStatus, { DocumentStatus } from './get-document-status';
import { documents } from './get-document-status.test.config';

describe('getDocumentStatus', () => {
  it('should return the correct status for a failed document', () => {
    expect(getDocumentStatus(documents[0])).toBe(DocumentStatus.UploadFailed);
  });

  it('should return the correct status for a pending document', () => {
    expect(getDocumentStatus(documents[1])).toBe(DocumentStatus.UploadIncomplete);
  });

  it('should return the correct status for complete document variations', () => {
    expect(getDocumentStatus(documents[2])).toBe(DocumentStatus.PendingHumanReview);
    expect(getDocumentStatus(documents[3])).toBe(DocumentStatus.ReviewedByHuman);
    expect(getDocumentStatus(documents[4])).toBe(DocumentStatus.PendingMachineReview);
    expect(getDocumentStatus(documents[5])).toBe(DocumentStatus.ReviewedByMachine);
  });

  it('should return the correct status a document with null statuses', () => {
    expect(getDocumentStatus(documents[6])).toBe(DocumentStatus.UploadedViaApi);
  });
});
