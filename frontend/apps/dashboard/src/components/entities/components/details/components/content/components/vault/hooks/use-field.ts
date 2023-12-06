import { useTranslation } from '@onefootprint/hooks';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import {
  IdDI,
  isVaultDataDecrypted,
  isVaultDataEncrypted,
} from '@onefootprint/types';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';

import {
  useDecryptControls,
  useEditControls,
} from '../components/vault-actions';

const useField = (entity: Entity) => {
  const { t } = useTranslation('di');
  const entityVaultWithTransforms = useEntityVaultWithTransforms(
    entity.id,
    entity,
  );

  const decryptControls = useDecryptControls();
  const editControls = useEditControls();

  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) =>
    entity.decryptableAttributes.includes(di);

  const canSelect = (di: DataIdentifier) => {
    const value = entityVaultWithTransforms.data?.vault[di];
    return canDecryptField(di) && isVaultDataEncrypted(value);
  };

  const canEditField = (di: DataIdentifier) => {
    if (di === IdDI.email || di === IdDI.phoneNumber) {
      return false;
    }
    // BE updates both ssn4 and ssn9 when ssn9 is changed and errors if only ssn4 is updated
    if (di === IdDI.ssn4) {
      return !entityVaultWithTransforms.data?.vault[IdDI.ssn9];
    }
    return di.startsWith('id');
  };

  const showEditView = editControls.inProgress;

  const getProps = (di: DataIdentifier) => {
    const value = entityVaultWithTransforms.data?.vault[di];
    const transforms = entityVaultWithTransforms.data?.transforms[di];
    return {
      canDecrypt: canDecryptField(di),
      canSelect: canSelect(di),
      disabled: !canSelect(di),
      label: t(di),
      name: di,
      showCheckbox,
      value,
      transforms,
      isDecrypted: isVaultDataDecrypted(value),
      canEditField: canEditField(di),
      showEditView,
    };
  };

  return getProps;
};

export default useField;
