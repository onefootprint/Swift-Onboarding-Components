import { type DataIdentifier, type Entity, isVaultDataDecrypted } from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';
import type { UploadWithDocument } from '../../types';

export const isUploadDecrypted = (entity: Entity, upload: UploadWithDocument) => {
  const entityVaultWithTransforms = useEntityVault(entity.id, entity);
  const di = `${upload.identifier}:${upload.version}` as DataIdentifier;
  return isVaultDataDecrypted(entityVaultWithTransforms.data?.vault?.[di]);
};

export const useDocumentField = (entity: Entity) => {
  const decryptControls = useDecryptControls();

  const getProps = (upload: UploadWithDocument) => {
    const canDecrypt = isDiDecryptable(entity, upload.identifier);
    const isDecrypted = isUploadDecrypted(entity, upload);
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
