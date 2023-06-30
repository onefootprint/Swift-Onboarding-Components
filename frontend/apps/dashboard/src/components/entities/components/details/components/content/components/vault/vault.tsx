import { EntityKind } from '@onefootprint/types';
import React from 'react';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import BusinessVault from './components/business-vault';
import DecryptProvider from './components/decrypt-machine';
import Form from './components/form';
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
      <Form onSubmit={decrypt.submitFields}>
        {context.kind === EntityKind.business ? (
          <BusinessVault />
        ) : (
          <PersonVault />
        )}
      </Form>
    </>
  );
};

const VaultWithDecryptProvider = () => (
  <DecryptProvider>
    <Vault />
  </DecryptProvider>
);

export default VaultWithDecryptProvider;
