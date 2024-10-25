import { type Document, type Entity, isVaultDataDecrypted } from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';

export const useDocumentField = (entity: Entity) => {
  const entityVaultWithTransforms = useEntityVault(entity.id, entity);
  const decryptControls = useDecryptControls();

  const canDecryptDocType = (document: Document) => {
    return document.uploads.every(({ identifier: di }) => isDiDecryptable(entity, di));
  };

  const isDocTypeDecrypted = (document: Document) => {
    const vault = entityVaultWithTransforms.data?.vault;
    return document.uploads.some(({ identifier: di }) => isVaultDataDecrypted(vault?.[di]));
  };

  const getProps = (document: Document) => {
    const canDecrypt = canDecryptDocType(document);
    const isDecrypted = isDocTypeDecrypted(document);
    return {
      canDecrypt,
      isDecrypted,
      showCheckbox: decryptControls.inProgress,
      isChecked: isDecrypted || decryptControls.inProgressDecryptingAll,
      disabled: !canDecrypt || isDecrypted,
    };
  };

  return getProps;
};

export default useDocumentField;
