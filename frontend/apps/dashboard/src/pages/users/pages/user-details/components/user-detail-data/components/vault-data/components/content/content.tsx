import { Vault } from '@onefootprint/types';
import React from 'react';
import { User } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import IdData from './components/id-data';
import IdDocData from './components/id-doc-data';
import InvestorProfileData from './components/investor-profile-data';

export type ContentProps = {
  user: User;
  vault: Vault;
  isDecrypting: boolean;
};

const Content = ({ user, vault, isDecrypting }: ContentProps) => {
  // TODO: https://linear.app/footprint/issue/FP-3148/dashboard-broker-create-a-centralized-method-to-see-if-user-has
  const shouldShowDoc = user.attributes.some(attr =>
    attr.startsWith('id_document'),
  );
  const shouldShowInvestorProfile = user.attributes.some(attr =>
    attr.startsWith('investor_profile'),
  );

  return (
    <Grid>
      <IdData user={user} vault={vault} isDecrypting={isDecrypting} />
      {shouldShowDoc && (
        <IdDocData user={user} vault={vault} isDecrypting={isDecrypting} />
      )}
      {shouldShowInvestorProfile && (
        <InvestorProfileData
          user={user}
          vault={vault}
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
