import styled, { css } from '@onefootprint/styled';
import {
  Entity,
  hasEntityCards,
  hasEntityCustomData,
  hasEntityDocuments,
  hasEntityInvestorProfile,
} from '@onefootprint/types';
import React from 'react';

import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import CardFieldset from './components/card-fieldset';
import CustomDataFields from './components/custom-data-fields';
import DocumentsFields from './components/document-fields';
import InvestorProfileFields from './components/investor-profile-fields';
import useFieldsets from './hooks/use-fieldsets';
import generateGridTemplateAreas from './utils/generate-grid-template-areas';

type PersonVaultProps = {
  entity: Entity;
};

const PersonVault = ({ entity }: PersonVaultProps) => {
  const {
    basic,
    address,
    identity,
    investorProfile,
    documents,
    cards,
    custom,
  } = useFieldsets();
  const hasCards = hasEntityCards(entity);
  const hasDocuments = hasEntityDocuments(entity);
  const hasInvestorProfile = hasEntityInvestorProfile(entity);
  const hasCustomData = hasEntityCustomData(entity);
  const gridTemplateAreas = generateGridTemplateAreas(entity);

  return (
    <Grid gridTemplateAreas={gridTemplateAreas}>
      <GridArea name="basic">
        <Fieldset
          fields={basic.fields}
          iconComponent={basic.iconComponent}
          title={basic.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </GridArea>
      <GridArea name="identity">
        <Fieldset
          fields={identity.fields}
          iconComponent={identity.iconComponent}
          title={identity.title}
          footer={<RiskSignalsOverview type="identity" />}
        />
      </GridArea>
      <GridArea name="address">
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="address" />}
        />
      </GridArea>
      {hasCards ? (
        <GridArea name="payment">
          <CardFieldset
            title={cards.title}
            iconComponent={cards.iconComponent}
          />
        </GridArea>
      ) : null}
      {hasDocuments ? (
        <GridArea name="documents">
          <Fieldset
            fields={documents.fields}
            iconComponent={documents.iconComponent}
            title={documents.title}
            footer={<RiskSignalsOverview type="document" />}
          >
            <DocumentsFields />
          </Fieldset>
        </GridArea>
      ) : null}
      {hasInvestorProfile ? (
        <GridArea name="investor-profile">
          <Fieldset
            fields={investorProfile.fields}
            iconComponent={investorProfile.iconComponent}
            title={investorProfile.title}
          >
            <InvestorProfileFields />
          </Fieldset>
        </GridArea>
      ) : null}
      {hasCustomData ? (
        <GridArea name="custom">
          <CustomDataFields
            entity={entity}
            title={custom.title}
            iconComponent={custom.iconComponent}
          />
        </GridArea>
      ) : null}
    </Grid>
  );
};

const Grid = styled.div<{
  gridTemplateAreas: string;
}>`
  ${({ theme, gridTemplateAreas }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas: ${gridTemplateAreas};
  `}
`;

const GridArea = styled.div<{ name: string }>`
  grid-area: ${({ name }) => name};
`;

export default PersonVault;
