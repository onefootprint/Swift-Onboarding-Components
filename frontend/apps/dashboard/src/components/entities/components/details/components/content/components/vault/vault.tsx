import type {
  DataIdentifier,
  EntityVault,
  VaultValue,
} from '@onefootprint/types';
import { EntityKind, IdDI } from '@onefootprint/types';
import React from 'react';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import type { WithEntityProps } from '../../../with-entity';
import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import EditForm from './components/edit-form';
import PersonVault from './components/person-vault';
import VaultActionControls, {
  useDecryptControls,
  useEditControls,
} from './components/vault-actions';
import EMPTY_SELECT_VALUE from './constants';
import type { EditFormData, EditSubmitData } from './vault.types';

type VaultProps = WithEntityProps;

const Vault = ({ entity }: VaultProps) => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();
  const edit = useEditControls();
  const vaultWithTransforms = useEntityVaultWithTransforms(entity.id, entity);
  const showEditForm = context.kind === EntityKind.person && edit.inProgress;

  const convertFormData = (
    formData: EditFormData,
    previousData?: EntityVault,
  ) => {
    const convertedData = {} as EditSubmitData;
    Object.keys(formData).forEach((key: string) => {
      const di = `id.${key}` as DataIdentifier; // Currently only IdDI data is editable
      let value = formData[key];

      // TODO: this logic depends on the fact that we only can edit IdDI data for now. Need to make it more generic
      if (typeof value === 'object' && !Array.isArray(value) && value !== null)
        return;
      if (value === (EMPTY_SELECT_VALUE as VaultValue)) {
        value = null;
      }
      if (di === IdDI.citizenships && value) {
        value = (value as string).split(', ');
      }

      const stayedEmpty = (!previousData || !previousData[di]) && !value;
      const wasDeleted = previousData && previousData[di] && !value;
      let wasEdited =
        (previousData && previousData[di] !== value) ||
        ((!previousData || !previousData[di]) && value);
      if (di === IdDI.citizenships && previousData && previousData[di]) {
        wasEdited = JSON.stringify(previousData[di]) !== JSON.stringify(value);
      }

      if (wasDeleted) {
        convertedData[di] = null;
      } else if (!stayedEmpty && wasEdited) {
        if ((di === IdDI.visaExpirationDate || di === IdDI.dob) && value) {
          const dateParts = (value as string).split(/[-/]/);
          const year = dateParts[0];
          const month = dateParts[1];
          const day = dateParts[2];
          value = `${year}-${month}-${day}`;
        }
        convertedData[di] = value;
      }
    });

    // Deletion quirk: if status is changed, unchanged legal status-related fields are overwritten
    if (convertedData[IdDI.usLegalStatus]) {
      const legalStatusDIs = [
        IdDI.nationality,
        IdDI.citizenships,
        IdDI.visaKind,
        IdDI.visaExpirationDate,
      ];
      legalStatusDIs.forEach(di => {
        const hadPreviousValue = previousData && previousData[di];
        const wasUnchanged = !(di in convertedData);
        if (hadPreviousValue && wasUnchanged) {
          convertedData[di] = previousData[di];
        }
      });
    }

    return convertedData;
  };

  const handleBeforeEditSubmit = (formData: EditFormData) => {
    const previousData = vaultWithTransforms.data?.vault;
    const convertedData = convertFormData(formData, previousData);
    edit.submitFields(convertedData);
    edit.saveEdit(entity.id, convertedData, {
      onSuccess: vaultWithTransforms.update,
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

export default Vault;
