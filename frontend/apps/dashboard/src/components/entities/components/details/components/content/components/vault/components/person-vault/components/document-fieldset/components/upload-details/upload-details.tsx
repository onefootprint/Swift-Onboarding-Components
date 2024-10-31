import { type EntityVault, type SupportedIdDocTypes, isVaultDataEncrypted } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import type { UploadWithDocument } from '../../types';
import getVaultKeyForUpload from '../../utils/get-upload-vault-key';
import Decrypt from '../decrypt';
import DetailsLayoutWrapper from '../details-layout-wrapper';
import DocumentImage from '../document-image';

export type UploadDetailsProps = {
  open: boolean;
  title: string;
  upload: UploadWithDocument;
  vault: EntityVault;
  isDecryptable: boolean;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
};

const UploadDetails = ({ isDecryptable, open, title, upload, vault, onDecrypt }: UploadDetailsProps) => {
  const { clear } = useDocumentsFilters();
  const di = getVaultKeyForUpload(upload);
  const vaultValue = vault[di] as string;
  const isEncrypted = !(di in vault) || (di in vault && isVaultDataEncrypted(vaultValue));

  return (
    <Dialog title={title} noPadding={true} noScroll={true} onClose={clear} open={open} size="full-screen">
      {isEncrypted ? (
        <Decrypt isDecryptable={isDecryptable} onClick={() => onDecrypt(upload.document.kind)} />
      ) : (
        <DetailsLayoutWrapper>
          <DocumentImage base64Data={vaultValue} documentName={title} isSuccess={upload.failureReasons.length === 0} />
        </DetailsLayoutWrapper>
      )}
    </Dialog>
  );
};

export default UploadDetails;
