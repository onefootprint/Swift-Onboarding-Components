import { Grid } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import useBusinessOwners from '@/entity/hooks/use-business-owners';
import { Entity } from '@onefootprint/types';
import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import useFieldsets from './hooks/use-fieldsets';

type BusinessVaultProps = {
  entity: Entity;
};

// TODO: Risk signals are not supported yet for KYB
// Waiting backend to adjust the method that will group the signals
// https://github.com/onefootprint/monorepo/blob/f4357b95e964248abc155a6b243dec080dbf4d4b/backend/components/newtypes/src/reason_code/signal_attribute.rs
// https://linear.app/footprint/issue/FP-3412/risk-signals-add-real-risk-signal-attributes
const BusinessVault = ({ entity }: BusinessVaultProps) => {
  const { basic, bos, address } = useFieldsets();
  const { data: boData } = useBusinessOwners(entity.id);
  const shouldRenderBos = !!boData?.length;
  const templateAreas = shouldRenderBos ? ['basic address', 'bos address'] : ['basic address'];

  return (
    <Grid.Container gap={5} columns={['repeat(2, 1fr)']} templateAreas={templateAreas}>
      <Basic>
        <Fieldset
          fields={basic.fields}
          iconComponent={basic.iconComponent}
          title={basic.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </Basic>
      {shouldRenderBos && (
        <Bos>
          <Fieldset
            fields={bos.fields}
            iconComponent={bos.iconComponent}
            title={bos.title}
            footer={<RiskSignalsOverview type="basic" />}
          />
        </Bos>
      )}
      <Address>
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </Address>
    </Grid.Container>
  );
};

const Basic = styled(Grid.Item)`
  grid-area: basic;
`;

const Address = styled(Grid.Item)`
  grid-area: address;
`;

const Bos = styled(Grid.Item)`
  grid-area: bos;
`;

export default BusinessVault;
