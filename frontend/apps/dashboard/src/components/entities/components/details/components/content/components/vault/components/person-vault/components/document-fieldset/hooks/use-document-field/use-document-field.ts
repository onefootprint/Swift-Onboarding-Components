import { type Document, type Entity, type EntityVault, isVaultDataDecrypted } from '@onefootprint/types';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';

export const useDocumentField = (entity: Entity, vault: EntityVault) => {
  const decryptControls = useDecryptControls();

  const isDocTypeDecryptable = (document: Document) => {
    return document.uploads.every(({ identifier: di }) => isDiDecryptable(entity, di));
  };

  const isDocTypeDecrypted = (document: Document) => {
    return document.uploads.some(({ identifier: di }) => isVaultDataDecrypted(vault?.[di]));
  };

  const getProps = (document: Document) => {
    const isDecryptable = isDocTypeDecryptable(document);
    const isDecrypted = isDocTypeDecrypted(document);
    return {
      isDecryptable,
      isDecrypted,
      showCheckbox: decryptControls.inProgress,
      isChecked: isDecrypted || decryptControls.inProgressDecryptingAll,
      disabled: !isDecryptable || isDecrypted,
    };
  };

  return getProps;
};

export default useDocumentField;
