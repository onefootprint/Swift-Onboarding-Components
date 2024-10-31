import { type Entity, type EntityVault, isVaultDataDecrypted } from '@onefootprint/types';

import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../vault-actions';
import type { UploadWithDocument } from '../../types';
import getVaultKeyForUpload from '../../utils/get-upload-vault-key';

export const isUploadDecrypted = (vault: EntityVault, upload: UploadWithDocument) => {
  const di = getVaultKeyForUpload(upload);
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
