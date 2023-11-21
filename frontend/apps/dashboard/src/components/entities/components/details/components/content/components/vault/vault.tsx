import { EntityKind } from '@onefootprint/types';
import React from 'react';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import BusinessVault from './components/business-vault';
import DecryptForm from './components/decrypt-form';
import DecryptProvider from './components/decrypt-machine';
import PersonVault from './components/person-vault';
import DecryptControls, {
  useDecryptControls,
} from './components/vault-actions';

const Vault = () => {
  const context = useEntityContext();
  const decrypt = useDecryptControls();

  return (
    <>
      <DecryptControls />
      <DecryptForm onSubmit={decrypt.submitFields}>
        {context.kind === EntityKind.business ? (
          <BusinessVault />
        ) : (
          <PersonVault />
        )}
      </DecryptForm>
    </>
  );
};

const VaultWithDecryptProvider = () => (
  <DecryptProvider>
    <Vault />
  </DecryptProvider>
);

export default VaultWithDecryptProvider;
