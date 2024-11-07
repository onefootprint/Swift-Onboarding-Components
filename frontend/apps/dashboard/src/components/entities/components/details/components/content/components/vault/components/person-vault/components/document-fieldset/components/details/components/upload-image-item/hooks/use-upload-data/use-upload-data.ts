import type { DataIdentifier, DocumentUpload, EntityVault } from '@onefootprint/types';
import { useObjectUrl } from '@onefootprint/ui';

const useUploadData = (upload: DocumentUpload, vault: EntityVault) => {
  const { identifier: di, version } = upload;
  const vaultIndex = `${di}:${version}` as DataIdentifier;
  const base64Data = (vault[vaultIndex] ?? vault[di]) as string;
  const { objectUrl, mimeType } = useObjectUrl(base64Data);
  const isPdf = mimeType === 'application/pdf';

  return { objectUrl, isPdf, di };
};

export default useUploadData;
