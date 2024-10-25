import { type DataIdentifier, type Entity, type EntityVault, isVaultDataDecrypted } from '@onefootprint/types';

import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';
import type { UploadWithDocument } from '../../types';

export const isUploadDecrypted = (vault: EntityVault, upload: UploadWithDocument) => {
  const di = `${upload.identifier}:${upload.version}` as DataIdentifier;
  return isVaultDataDecrypted(vault[di]);
};

export const useUploadField = (entity: Entity, vault: EntityVault) => {
  const decryptControls = useDecryptControls();

  const getProps = (upload: UploadWithDocument) => {
    const isDecryptable = isDiDecryptable(entity, upload.identifier);
    const isDecrypted = isUploadDecrypted(vault, upload);
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

export default useUploadField;
