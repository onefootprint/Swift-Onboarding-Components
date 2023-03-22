import type { Vault } from '@onefootprint/types';
import React from 'react';
import { User } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import RiskSignalsOverview from '../risk-signals-overview';
import Section from './components/section';
import useFields from './hooks/use-fields';

export type IdDataProps = {
  user: User;
  vault: Vault;
  isDecrypting: boolean;
};

const IdData = ({ user, vault, isDecrypting }: IdDataProps) => {
  const { basic, identity, address } = useFields(user, vault, isDecrypting);
  const showRiskSignals = user.isPortable;

  return (
    <Grid>
      <Section
        fields={basic.fields}
        footer={showRiskSignals && <RiskSignalsOverview type="basic" />}
        iconComponent={basic.icon}
        showCta={isDecrypting && basic.fields.some(field => field.canSelect)}
        title={basic.title}
      />
      <Section
        fields={identity.fields}
        footer={showRiskSignals && <RiskSignalsOverview type="identity" />}
        iconComponent={identity.icon}
        showCta={isDecrypting && identity.fields.some(field => field.canSelect)}
        title={identity.title}
      />
      <AddressContainer>
        <Section
          fields={address.fields}
          footer={showRiskSignals && <RiskSignalsOverview type="address" />}
          iconComponent={address.icon}
          showCta={
            isDecrypting && address.fields.some(field => field.canSelect)
          }
          title={address.title}
        />
      </AddressContainer>
    </Grid>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

const AddressContainer = styled.div`
  grid-row: 1 / span 2;
  grid-column: 2 / 2;
`;

export default IdData;
