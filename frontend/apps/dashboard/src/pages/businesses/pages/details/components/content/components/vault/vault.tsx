import React from 'react';
import styled, { css } from 'styled-components';

import DecryptControls, {
  useDecryptControls,
} from './components/decrypt-controls';
import DecryptProvider from './components/decrypt-machine';
import Fieldset from './components/fieldset';
import Form from './components/form';
import useFieldsets from './hooks/use-fieldsets';

const Vault = () => {
  const decrypt = useDecryptControls();
  const { basic, bos, address } = useFieldsets();

  return (
    <>
      <DecryptControls />
      <Form onSubmit={decrypt.submitFields}>
        <Grid>
          <Basic>
            <Fieldset
              fields={basic.fields}
              iconComponent={basic.iconComponent}
              title={basic.title}
            />
          </Basic>
          <Bos>
            <Fieldset
              fields={bos.fields}
              iconComponent={bos.iconComponent}
              title={bos.title}
            />
          </Bos>
          <Address>
            <Fieldset
              fields={address.fields}
              iconComponent={address.iconComponent}
              title={address.title}
            />
          </Address>
        </Grid>
      </Form>
    </>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'basic address'
      'bos address';
  `}
`;

const Basic = styled.div`
  grid-area: basic;
`;

const Address = styled.div`
  grid-area: address;
`;

const Bos = styled.div`
  grid-area: bos;
`;

const VaultWithDecryptProvider = () => (
  <DecryptProvider>
    <Vault />
  </DecryptProvider>
);

export default VaultWithDecryptProvider;
