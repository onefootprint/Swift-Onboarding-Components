import { Box } from '@onefootprint/ui';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import styled, { css } from 'styled-components';

import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdDocSection from './components/id-doc-section';
import IdentitySection from './components/identity-section';

const ViewVaultData = () => {
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const sectionsVisibility = getSectionsVisibility(vaultData);
  const { identitySection, addressSection, idDocSection } = sectionsVisibility;

  return (
    <Container>
      <DataGrid>
        <BasicSection />
        {identitySection && <IdentitySection />}
        {addressSection && (
          <Box
            sx={{
              gridRow: identitySection ? '1 / span 2' : undefined,
              gridColumn: '2 / 2',
            }}
          >
            <AddressSection />
          </Box>
        )}
      </DataGrid>
      {idDocSection && <IdDocSection />}
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
