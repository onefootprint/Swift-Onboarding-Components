import transformUploadsWithDocuments from './transform-uploads-with-documents';
import { documents } from './transform-uploads-with-documents.test.config';

describe('transformUploadsWithDocuments', () => {
  it('should transform documents into uploads with documents', () => {
    const { uploads: idCardUploads, ...idCardWithoutUploads } = documents[0];
    const { uploads: licenseUploads, ...licenseWithoutUploads } = documents[1];
    const results = transformUploadsWithDocuments(documents);

    expect(results[0]).toEqual({
      ...idCardUploads[0],
      document: idCardWithoutUploads,
      documentId: 'document.id_card.front.latest_upload-2020-01-01T00:00:00.000Z',
    });
    expect(results[1]).toEqual({
      ...idCardUploads[1],
      document: idCardWithoutUploads,
      documentId: 'document.id_card.back.latest_upload-2020-01-01T00:00:00.000Z',
    });
    expect(results[2]).toEqual({
      ...idCardUploads[2],
      document: idCardWithoutUploads,
      documentId: 'document.id_card.selfie.latest_upload-2020-01-01T00:00:00.000Z',
    });
    expect(results[3]).toEqual({
      ...licenseUploads[0],
      document: licenseWithoutUploads,
      documentId: 'document.drivers_license.front.latest_upload-2020-08-09T00:00:00.000Z',
    });
  });
});
