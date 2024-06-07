import type { Entity } from '@onefootprint/types';
import {
  hasEntityCards,
  hasEntityCustomData,
  hasEntityDocuments,
  hasEntityInvestorProfile,
  hasEntityUsLegalStatus,
} from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import useEntityOwnedBusinesses from '@/entity/hooks/use-entity-owned-businesses';

import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import CardFieldset from './components/card-fieldset';
import CustomDataFields from './components/custom-data-fields';
import DocumentsFields from './components/document-fields';
import InvestorProfileFields from './components/investor-profile-fields';
import OwnedBusinesses from './components/owned-businesses';
import useFieldsets from './hooks/use-fieldsets';
import getGridTemplateAreas from './utils/get-grid-template-areas';

type PersonVaultProps = {
  entity: Entity;
};

const PersonVault = ({ entity }: PersonVaultProps) => {
  const hasUsLegalStatus = hasEntityUsLegalStatus(entity);
  const { basic, address, usLegalStatus, identity, investorProfile, documents, cards, custom } =
    useFieldsets(hasUsLegalStatus);
  const hasCards = hasEntityCards(entity);
  const hasDocuments = hasEntityDocuments(entity);
  const hasInvestorProfile = hasEntityInvestorProfile(entity);
  const hasCustomData = hasEntityCustomData(entity);
  const { ownedBusinesses, hasBusinesses } = useEntityOwnedBusinesses(entity.id);

  // if there are three elements, we want to display as grid
  const displayFirstSectionAsGrid = getGridTemplateAreas({ entity, hasBusinesses }) <= 3;

  const gridFirstSection = (
    <Grid>
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
    </Grid>
  );

  const basicAddressIdentity = (
    <>
      <GridItem>
        <Fieldset
          fields={basic.fields}
          iconComponent={basic.iconComponent}
          title={basic.title}
          footer={<RiskSignalsOverview type="basic" />}
        />
      </GridItem>
      <GridItem>
        <Fieldset
          fields={address.fields}
          iconComponent={address.iconComponent}
          title={address.title}
          footer={<RiskSignalsOverview type="address" />}
        />
      </GridItem>
      <GridItem>
        <Fieldset
          fields={identity.fields}
          iconComponent={identity.iconComponent}
          title={identity.title}
          footer={<RiskSignalsOverview type="identity" />}
        />
      </GridItem>
    </>
  );

  return (
    <Vault>
      {displayFirstSectionAsGrid && gridFirstSection}
      <Container>
        {!displayFirstSectionAsGrid && basicAddressIdentity}
        {hasUsLegalStatus ? (
          <GridItem>
            <Fieldset
              fields={usLegalStatus.fields}
              iconComponent={usLegalStatus.iconComponent}
              title={usLegalStatus.title}
            />
          </GridItem>
        ) : null}
        {hasDocuments ? (
          <GridItem>
            <Fieldset
              fields={documents.fields}
              iconComponent={documents.iconComponent}
              title={documents.title}
              footer={<RiskSignalsOverview type="document" />}
            >
              <DocumentsFields />
            </Fieldset>
          </GridItem>
        ) : null}
        {hasCards ? (
          <GridItem>
            <CardFieldset title={cards.title} iconComponent={cards.iconComponent} />
          </GridItem>
        ) : null}
        {hasBusinesses ? (
          <GridItem>
            <OwnedBusinesses businesses={ownedBusinesses} />
          </GridItem>
        ) : null}
        {hasCustomData ? (
          <WideGridItem>
            <CustomDataFields entity={entity} title={custom.title} iconComponent={custom.iconComponent} />
          </WideGridItem>
        ) : null}
        {hasInvestorProfile ? (
          // we always want investor profile to span two columns
          <WideGridItem>
            <Fieldset
              fields={investorProfile.fields}
              iconComponent={investorProfile.iconComponent}
              title={investorProfile.title}
            >
              <InvestorProfileFields />
            </Fieldset>
          </WideGridItem>
        ) : null}
      </Container>
    </Vault>
  );
};

const Vault = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    width: 100%;
    flex-direction: column;
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[5]};
  `};
`;

// spans one column if it can, two if there are extra elements
const GridItem = styled.div`
  ${({ theme }) => css`
    flex: 1 1 calc(50% - ${theme.spacing[5]});
  `};
`;

// spans two columns always
const WideGridItem = styled.div`
  ${({ theme }) => css`
    flex: 1 1 calc(100% - ${theme.spacing[5]});
  `};
`;

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas: ${`'basic address' 'identity address'`};
  `};
`;

const GridArea = styled.div<{ name: string }>`
  grid-area: ${({ name }) => name};
`;

export default PersonVault;
