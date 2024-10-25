import {
  type DataIdentifier,
  type Document,
  type EntityVault,
  type SupportedIdDocTypes,
  isVaultDataEncrypted,
} from '@onefootprint/types';
import { Dialog, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import Decrypt from '../decrypt/decrypt';
import DocumentImage from '../document-image';
import UploadTitleCard from './components/upload-title-card/upload-title-card';

export type LicenseAndSelfieDetailsProps = {
  document: Document;
  isDecryptable: boolean;
  open: boolean;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
  vault: EntityVault;
};

const LicenseAndSelfieDetails = ({ document, isDecryptable, open, onDecrypt, vault }: LicenseAndSelfieDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const { clear } = useDocumentsFilters();
  const { uploads } = document;
  const isEncrypted = document.uploads
    .map(u => `${u.identifier}:${u.version}` as DataIdentifier)
    .some(di => !(di in vault) || (di in vault && isVaultDataEncrypted(vault?.[di])));

  return (
    <Dialog
      title={t('license-and-selfie')}
      noPadding={true}
      noScroll={true}
      onClose={clear}
      open={open}
      size="full-screen"
    >
      {isEncrypted ? (
        <Decrypt isDecryptable={isDecryptable} onClick={() => onDecrypt(document.kind)} />
      ) : (
        <Stack direction="column" align="center" gap={8} width="90%">
          {uploads.map(upload => {
            const vaultIndex = `${upload.identifier}:${upload.version}` as DataIdentifier;
            const vaultValue = vault[vaultIndex] as string;
            return (
              <Stack direction="column" align="center" gap={4} width="100%">
                <UploadTitleCard upload={upload} />
                <DocumentImage
                  base64Data={vaultValue}
                  documentName={t('license-and-selfie')}
                  isSuccess={upload.failureReasons.length === 0}
                />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Dialog>
  );
};

export default LicenseAndSelfieDetails;
