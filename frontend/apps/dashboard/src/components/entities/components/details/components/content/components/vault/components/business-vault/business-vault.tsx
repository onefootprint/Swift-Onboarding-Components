import React from 'react';
import styled, { css } from 'styled-components';

import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import useFieldsets from './hooks/use-fieldsets';

// TODO: Risk signals are not supported yet for KYB
// Waiting backend to adjust the method that will group the signals
// https://github.com/onefootprint/monorepo/blob/f4357b95e964248abc155a6b243dec080dbf4d4b/backend/components/newtypes/src/reason_code/signal_attribute.rs
// https://linear.app/footprint/issue/FP-3412/risk-signals-add-real-risk-signal-attributes
const BusinessVault = () => {
  const { basic, bos, address } = useFieldsets();

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
      <Bos>
        <Fieldset
          fields={bos.fields}
          iconComponent={bos.iconComponent}
          title={bos.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </Bos>
      <Address>
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="basic" />}
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

export default BusinessVault;
