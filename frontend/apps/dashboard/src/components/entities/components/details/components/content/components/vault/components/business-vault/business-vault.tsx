import { getEntitiesByFpIdBusinessOwnersOptions } from '@onefootprint/axios/dashboard';
import { IcoBuilding16 } from '@onefootprint/icons';
import { type Entity, hasEntityCustomData } from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AddressFieldset from '../address-fieldset';
import CustomDataFields from '../custom-data-fields';
import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import useFieldsets from './hooks/use-fieldsets';
import BusinessOwners from './hooks/use-fieldsets/components/business-owners';

type BusinessVaultProps = {
  entity: Entity;
};

const BusinessVault = ({ entity }: BusinessVaultProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault' });
  const { basic, address, custom } = useFieldsets();
  const bosQuery = useQuery(
    getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: entity.id },
    }),
  );
  const hasBos = !!bosQuery.data?.length;
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
            fields={[]}
            iconComponent={IcoBuilding16}
            title={t('bos.title')}
            footer={<RiskSignalsOverview type="basic" />}
          >
            {/* @ts-expect-error fix once we migrate to the new entity types */}
            <BusinessOwners entity={entity} />
          </Fieldset>
        </Bos>
      ) : null}
      <Address>
        <AddressFieldset
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
