import {
  type DataIdentifier,
  type Document,
  type Entity,
  type EntityVault,
  isVaultDataDecrypted,
} from '@onefootprint/types';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';

export const useDocumentField = (entity: Entity, vault: EntityVault) => {
  const decryptControls = useDecryptControls();

  const isDocTypeDecryptable = ({ uploads }: Document) => {
    return uploads.every(({ identifier: di }) => isDiDecryptable(entity, di));
  };

  const isDocTypeDecrypted = ({ uploads }: Document) => {
    return uploads.some(({ identifier: di, version }) => {
      const diWithVersion = `${di}:${version}` as DataIdentifier;
      return isVaultDataDecrypted(vault?.[di]) || isVaultDataDecrypted(vault?.[diWithVersion]);
    });
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
