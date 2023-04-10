import React from 'react';
import styled, { css } from 'styled-components';

import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import useFieldsets from './hooks/use-fieldsets';

const PersonVault = () => {
  const { basic, address, identity } = useFieldsets();

  return (
    <Grid>
      <Basic>
        <Fieldset
          fields={basic.fields}
          iconComponent={basic.iconComponent}
          title={basic.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </Basic>
      <Identity>
        <Fieldset
          fields={identity.fields}
          iconComponent={identity.iconComponent}
          title={identity.title}
          footer={<RiskSignalsOverview type="identity" />}
        />
      </Identity>
      <Address>
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="address" />}
        />
      </Address>
    </Grid>
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
      'identity address';
  `}
`;

const Basic = styled.div`
  grid-area: basic;
`;

const Address = styled.div`
  grid-area: address;
`;

const Identity = styled.div`
  grid-area: identity;
`;

export default PersonVault;
