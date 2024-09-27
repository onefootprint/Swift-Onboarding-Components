import type { EntityVault } from '@onefootprint/types';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';

import type { EditSubmitData } from '../../../components/edit-vault-drawer/edit-vault-drawer.types';
import transformResponseToVaultFormat from '../../utils/transform-response-to-vault-format';
import useEditText from './hooks/use-edit';

type EditPayload = {
  entityId: string;
  vaultData?: EditSubmitData;
};

type EditCallbacks = {
  onSuccess?: (response: EntityVault) => void;
  onError?: (error: unknown) => void;
};

const useEditFields = () => {
  const editText = useEditText();
  const entityId = useEntityId();

  const editFields = ({ vaultData }: EditPayload, { onSuccess, onError }: EditCallbacks) => {
    if (vaultData) {
      editText
        .mutateAsync({
          entityId,
          fields: vaultData,
        })
        .then(transformResponseToVaultFormat)
        .then(onSuccess)
        .catch(onError);
    }
  };

  return editFields;
};

export default useEditFields;
