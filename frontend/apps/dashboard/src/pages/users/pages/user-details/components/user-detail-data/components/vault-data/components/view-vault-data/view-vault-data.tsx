import { Box } from '@onefootprint/ui';
import React from 'react';
import { User } from 'src/pages/users/types/user.types';
import styled, { css } from 'styled-components';

import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdDocSection from './components/id-doc-section';
import IdentitySection from './components/identity-section';

type ViewVaultDataProps = {
  user: User;
};

const ViewVaultData = ({ user }: ViewVaultDataProps) => {
  const sectionsVisibility = getSectionsVisibility(user.vaultData);
  const { identitySection, addressSection, idDocSection } = sectionsVisibility;

  return (
    <Container>
      <DataGrid>
        <BasicSection vaultData={user.vaultData} />
        {identitySection && <IdentitySection vaultData={user.vaultData} />}
        {addressSection && (
          <Box
            sx={{
              gridRow: identitySection ? '1 / span 2' : undefined,
              gridColumn: '2 / 2',
            }}
          >
            <AddressSection vaultData={user.vaultData} />
          </Box>
        )}
      </DataGrid>
      {idDocSection && <IdDocSection vaultData={user.vaultData} />}
    </Container>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
  `};
`;

export default ViewVaultData;
