import {
  type DataIdentifier,
  type EntityVault,
  type SupportedIdDocTypes,
  isVaultDataEncrypted,
} from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import type { UploadWithDocument } from '../../types';
import Decrypt from '../decrypt';
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
  const { document, identifier, version } = upload;

  const di = `${identifier}:${version}` as DataIdentifier;
  const vaultValue = vault[di] as string;
  const isEncrypted = !(di in vault) || (di in vault && isVaultDataEncrypted(vaultValue));

  return (
    <Dialog title={title} noPadding={true} noScroll={true} onClose={clear} open={open} size="full-screen">
      {isEncrypted ? (
        <Decrypt isDecryptable={isDecryptable} onClick={() => onDecrypt(document.kind)} />
      ) : (
        <DocumentImage base64Data={vaultValue} documentName={title} isSuccess={upload.failureReasons.length === 0} />
      )}
    </Dialog>
  );
};

export default UploadDetails;
