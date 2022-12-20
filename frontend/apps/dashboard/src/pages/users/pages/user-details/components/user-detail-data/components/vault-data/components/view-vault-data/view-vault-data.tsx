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
      {idDocSection && (
        <Box
          sx={{
            gridRow: '3 / 3',
            gridColumn: '1 / 3',
          }}
        >
          <IdDocSection />
        </Box>
      )}
    </DataGrid>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default ViewVaultData;
