import {
  Entity,
  hasEntityDocuments,
  hasEntityInvestorProfile,
} from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import Fieldset from '../fieldset';
import RiskSignalsOverview from '../risk-signals-overview';
import DocumentsFields from './components/document-fields';
import InvestorProfileFields from './components/investor-profile-fields';
import useFieldsets from './hooks/use-fieldsets';

type PersonVaultProps = {
  entity: Entity;
};

const PersonVault = ({ entity }: PersonVaultProps) => {
  const { basic, address, identity, investorProfile, documents } =
    useFieldsets();

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
      {hasEntityDocuments(entity) ? (
        <Documents>
          <Fieldset
            fields={documents.fields}
            iconComponent={documents.iconComponent}
            title={documents.title}
            footer={<RiskSignalsOverview type="document" />}
          >
            <DocumentsFields />
          </Fieldset>
        </Documents>
      ) : null}
      {hasEntityInvestorProfile(entity) ? (
        <InvestorProfile>
          <Fieldset
            fields={investorProfile.fields}
            iconComponent={investorProfile.iconComponent}
            title={investorProfile.title}
          >
            <InvestorProfileFields />
          </Fieldset>
        </InvestorProfile>
      ) : null}
    </Grid>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'basic address'
      'identity address'
      'documents documents'
      'investor-profile investor-profile';
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

const Documents = styled.div`
  grid-area: documents;
`;

const InvestorProfile = styled.div`
  grid-area: investor-profile;
`;

export default PersonVault;
