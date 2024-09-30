import type { DataIdentifier, SupportedIdDocTypes } from '@onefootprint/types';
import { EntityKind } from '@onefootprint/types';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import flat from 'flat';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import type { WithEntityProps } from '../../../with-entity';
import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import PersonVault from './components/person-vault';
import VaultActions, { useDecryptControls } from './components/vault-actions';
import type { DecryptFormData } from './vault.types';

type VaultProps = WithEntityProps;

const Vault = ({ entity }: VaultProps) => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();

  const handleBeforeDecryptSubmit = (formData: DecryptFormData) => {
    // Return early if this is triggered from subbmitting EditForm or ViewHistoricalDataForm
    if (isEmpty(formData)) {
      return;
    }

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
      <DecryptForm onSubmit={handleBeforeDecryptSubmit}>
        <VaultActions entity={entity} />
        {context.kind === EntityKind.person ? <PersonVault /> : <BusinessVault />}
      </DecryptForm>
    </>
  );
};

export default Vault;
