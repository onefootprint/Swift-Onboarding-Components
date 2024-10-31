import getVaultKeyForUpload from './get-vault-key-for-upload';
import { customDocumentUpload, documentUpload } from './get-vault-key-for-upload.test.config';

describe('getVaultKeyForUpload', () => {
  it('should return the upload identifier for custom documents', () => {
    const di = getVaultKeyForUpload(customDocumentUpload);
    expect(di).toEqual('document.custom.city_verification');
  });

  it('should return a DI including the upload identifier and version for other documents', () => {
    const di = getVaultKeyForUpload(documentUpload);
    expect(di).toEqual('document.passport_card.front.latest_upload:123');
  });
});
