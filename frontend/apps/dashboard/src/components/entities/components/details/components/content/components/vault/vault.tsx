import type { DataIdentifier, EntityVault } from '@onefootprint/types';
import { EntityKind } from '@onefootprint/types';
import React from 'react';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import type { WithEntityProps } from '../../../with-entity';
import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import DecryptProvider from './components/decrypt-machine';
import EditForm from './components/edit-form';
import EditProvider from './components/edit-machine';
import PersonVault from './components/person-vault';
import VaultActionControls, {
  useDecryptControls,
  useEditControls,
} from './components/vault-actions';
import type { EditFormData, EditSubmitData } from './vault.types';

type VaultProps = WithEntityProps;

const Vault = ({ entity }: VaultProps) => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();
  const edit = useEditControls();
  const entityVault = useEntityVaultWithTransforms(entity.id, entity);
  const showEditForm = context.kind === EntityKind.person && edit.inProgress;

  const convertFormData = (
    formData: EditFormData,
    previousData?: EntityVault,
  ) => {
    const convertedData = {} as EditSubmitData;
    Object.keys(formData).forEach((key: string) => {
      const value = formData[key];
      const di = `id.${key}` as DataIdentifier; // Currently only IdDI data is editable
      const wasDeleted = previousData && previousData[di] && !value;
      const stayedEmpty = (!previousData || !previousData[di]) && !value;
      const wasEdited =
        (previousData && previousData[di] !== value) ||
        ((!previousData || !previousData[di]) && value);
      if (wasDeleted) {
        convertedData[di] = undefined;
      } else if (!stayedEmpty && wasEdited) {
        convertedData[di] = value;
      }
    });
    return convertedData;
  };

  const handleBeforeEditSubmit = (formData: EditFormData) => {
    const previousData = entityVault.data;
    const convertedData = convertFormData(formData, previousData);
    edit.submitFields(convertedData);
    edit.saveEdit(entity.id, convertedData, {
      onSuccess: entityVault.update,
    });
  };

  return (
    <>
      <VaultActionControls entity={entity} />
      {showEditForm ? (
        <EditForm onSubmit={handleBeforeEditSubmit}>
          <PersonVault />
        </EditForm>
      ) : (
        <DecryptForm onSubmit={decrypt.submitFields}>
          {context.kind === EntityKind.business ? (
            <BusinessVault />
          ) : (
            <PersonVault />
          )}
        </DecryptForm>
      )}
    </>
  );
};

const VaultWithDecryptProvider = ({ entity }: VaultProps) => (
  <EditProvider>
    <DecryptProvider>
      <Vault entity={entity} />
    </DecryptProvider>
  </EditProvider>
);

export default VaultWithDecryptProvider;
