import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';
import styled from 'styled-components';

import RiskSignalsOverview from '../risk-signals-overview';
import Section from './components/section';
import useRows from './hooks/use-rows';

export type KycDataProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const KycData = ({ user, vaultData, isDecrypting }: KycDataProps) => {
  const { basic, identity, address } = useRows(user, vaultData, isDecrypting);
  const showRiskSignals = user.isPortable;

  return (
    <>
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
    </>
  );
};

const AddressContainer = styled.div`
  grid-row: 1 / span 2;
  grid-column: 2 / 2;
`;

export default KycData;
