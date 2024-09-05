import type { DataIdentifier, SupportedIdDocTypes, VaultValue } from '@onefootprint/types';
import { EntityKind } from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

import flat from 'flat';
import get from 'lodash/get';
import type { WithEntityProps } from '../../../with-entity';
import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import EditForm from './components/edit-form';
import convertFormData from './components/edit-form/utils/convert-form-data';
import PersonVault from './components/person-vault';
import VaultActions, { useDecryptControls, useEditControls } from './components/vault-actions';
import type { DecryptFormData } from './vault.types';

type VaultProps = WithEntityProps;

const Vault = ({ entity }: VaultProps) => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();
  const edit = useEditControls();
  const vaultWithTransforms = useEntityVault(entity.id, entity);
  const showEditForm = edit.inProgress;

  const handleBeforeEditSubmit = (flattenedFormData: Record<string, VaultValue>) => {
    const previousData = vaultWithTransforms.data?.vault;
    const convertedData = convertFormData(flattenedFormData, previousData);
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
          {context.kind === EntityKind.person ? <PersonVault /> : <BusinessVault />}
        </EditForm>
      ) : (
        <DecryptForm onSubmit={handleBeforeDecryptSubmit}>
          {context.kind === EntityKind.person ? <PersonVault /> : <BusinessVault />}
        </DecryptForm>
      )}
    </>
  );
};

export default Vault;
