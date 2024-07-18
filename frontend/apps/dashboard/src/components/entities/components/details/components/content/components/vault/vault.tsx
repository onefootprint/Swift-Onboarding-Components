import type { DataIdentifier, EntityVault, SupportedIdDocTypes, VaultValue } from '@onefootprint/types';
import { EntityKind, IdDI } from '@onefootprint/types';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

import flat from 'flat';
import get from 'lodash/get';
import type { WithEntityProps } from '../../../with-entity';
import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import EditForm from './components/edit-form';
import PersonVault from './components/person-vault';
import VaultActions, { useDecryptControls, useEditControls } from './components/vault-actions';
import EMPTY_SELECT_VALUE from './constants';
import type { DecryptFormData, EditFormData, EditSubmitData } from './vault.types';

type VaultProps = WithEntityProps;

const Vault = ({ entity }: VaultProps) => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();
  const edit = useEditControls();
  const vaultWithTransforms = useEntityVault(entity.id, entity);
  const showEditForm = context.kind === EntityKind.person && edit.inProgress;

  const convertFormData = (formData: EditFormData, previousData?: EntityVault) => {
    const convertedData = {} as EditSubmitData;
    Object.keys(formData).forEach((key: string) => {
      const di = `id.${key}` as DataIdentifier; // Currently only IdDI data is editable
      let value = formData[key];

      // TODO: this logic depends on the fact that we only can edit IdDI data for now. Need to make it more generic
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) return;
      if (value === (EMPTY_SELECT_VALUE as VaultValue)) {
        value = null;
      }
      if (di === IdDI.citizenships && value) {
        value = (value as string).split(', ');
      }

      const stayedEmpty = (!previousData || !previousData[di]) && !value;
      const wasDeleted = previousData && previousData[di] && !value;
      let wasEdited = (previousData && previousData[di] !== value) || ((!previousData || !previousData[di]) && value);
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
      const legalStatusDIs = [IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate];
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

  const handleBeforeDecryptSubmit = (formData: DecryptFormData) => {
    const { documents: documentsMap, ...dis } = formData;
    // Convert the form data
    const fields = Object.keys(flat(dis))
      .filter(di => get(dis, di))
      .map(di => di as DataIdentifier);
    const documents = Object.entries(documentsMap || {})
      .filter(([, value]) => value)
      .map(([kind]) => kind as SupportedIdDocTypes);
    decrypt.submitFields(fields, documents);
  };

  return (
    <>
      <VaultActions entity={entity} />
      {showEditForm ? (
        <EditForm onSubmit={handleBeforeEditSubmit}>
          <PersonVault />
        </EditForm>
      ) : (
        <DecryptForm onSubmit={handleBeforeDecryptSubmit}>
          {context.kind === EntityKind.business ? <BusinessVault /> : <PersonVault />}
        </DecryptForm>
      )}
    </>
  );
};

export default Vault;
