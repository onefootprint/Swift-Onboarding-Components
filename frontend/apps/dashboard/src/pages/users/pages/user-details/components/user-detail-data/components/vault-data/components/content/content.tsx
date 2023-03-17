import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import IdDocData from './components/id-doc-data';
import InvestorProfileData from './components/investor-profile-data';
import KycData from './components/kyc-data';

export type ContentProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const Content = ({ user, vaultData, isDecrypting }: ContentProps) => {
  // TODO: https://linear.app/footprint/issue/FP-3148/dashboard-broker-create-a-centralized-method-to-see-if-user-has
  const shouldShowInvestorProfile = user.attributes.some(attr =>
    attr.startsWith('investor_profile'),
  );

  return (
    <Grid>
      <KycData user={user} vaultData={vaultData} isDecrypting={isDecrypting} />
      <IdDocData
        user={user}
        vaultData={vaultData}
        isDecrypting={isDecrypting}
      />
      {shouldShowInvestorProfile && (
        <InvestorProfileData
          user={user}
          vaultData={vaultData}
          isDecrypting={isDecrypting}
        />
      )}
    </Grid>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
  `};
`;

export default Content;
