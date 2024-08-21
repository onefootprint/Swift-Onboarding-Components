import { Grid } from '@onefootprint/ui';
import styled from 'styled-components';

import useBusinessOwners from '@/entity/hooks/use-business-owners';
import { type Entity, hasEntityCustomData } from '@onefootprint/types';
import CustomDataFields from '../custom-data-fields';
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
  const { basic, bos, address, custom } = useFieldsets();
  const { data: boData } = useBusinessOwners(entity.id);
  const hasBos = !!boData?.length;
  const hasCustomData = hasEntityCustomData(entity);
  const templateAreas = getTemplateAreas(hasBos, hasCustomData);

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
      {hasBos ? (
        <Bos>
          <Fieldset
            fields={bos.fields}
            iconComponent={bos.iconComponent}
            title={bos.title}
            footer={<RiskSignalsOverview type="basic" />}
          />
        </Bos>
      ) : null}
      <Address>
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </Address>
      {hasCustomData ? (
        <Custom>
          <CustomDataFields entity={entity} title={custom.title} iconComponent={custom.iconComponent} />
        </Custom>
      ) : null}
    </Grid.Container>
  );
};

const getTemplateAreas = (hasBos: boolean, hasCustomData: boolean) => {
  if (hasBos && hasCustomData) {
    return ['basic address', 'bos address', 'custom custom'];
  }
  if (hasBos) {
    return ['basic address', 'bos address'];
  }
  if (hasCustomData) {
    return ['basic address', 'custom custom'];
  }
  return ['basic address'];
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

const Custom = styled(Grid.Item)`
  grid-area: custom;
`;

export default BusinessVault;
