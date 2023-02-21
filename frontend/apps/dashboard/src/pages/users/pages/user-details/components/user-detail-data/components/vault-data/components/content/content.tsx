import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import IdDocData from './components/id-doc-data';
import KycData from './components/kyc-data';

export type ContentProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const Content = ({ user, vaultData, isDecrypting }: ContentProps) => (
  <Container>
    <KycData user={user} vaultData={vaultData} isDecrypting={isDecrypting} />
    <IdDocContainer>
      <IdDocData
        user={user}
        vaultData={vaultData}
        isDecrypting={isDecrypting}
      />
    </IdDocContainer>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

const IdDocContainer = styled.div`
  grid-row: 3 / 3;
  grid-column: 1 / 3;
`;

export default Content;
