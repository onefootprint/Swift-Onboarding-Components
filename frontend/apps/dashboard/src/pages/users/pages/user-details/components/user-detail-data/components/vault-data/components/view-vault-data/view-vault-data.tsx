import { Box } from '@onefootprint/ui';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';

import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdentitySection from './components/identity-section';

type ViewVaultDataProps = {
  user: User;
};

const ViewVaultData = ({ user }: ViewVaultDataProps) => {
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);
  const showIdentity = sectionsVisibility.identity;
  const showAddress = sectionsVisibility.address;

  return (
    <DataGrid>
      <BasicSection
        identityDataAttributes={user.identityDataAttributes}
        attributes={user.attributes}
      />
      {showIdentity && (
        <IdentitySection
          identityDataAttributes={user.identityDataAttributes}
          attributes={user.attributes}
        />
      )}
      {showAddress && (
        <Box
          sx={{
            gridRow: showIdentity ? '1 / span 2' : undefined,
            gridColumn: '2 / 2',
          }}
        >
          <AddressSection
            identityDataAttributes={user.identityDataAttributes}
            attributes={user.attributes}
          />
        </Box>
      )}
    </DataGrid>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default ViewVaultData;
