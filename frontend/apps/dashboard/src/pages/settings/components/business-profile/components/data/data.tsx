import styled, { css } from '@onefootprint/styled';
import type { Organization } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Logo from './components/logo';
import Name from './components/name';
import Website from './components/website';

type DataProps = {
  organization: Organization;
};

const Data = ({ organization }: DataProps) => (
  <Box testID="business-profile-data">
    <Logo organization={organization} />
    <Grid>
      <Name value={organization.name} />
      <Website value={organization.websiteUrl} />
    </Grid>
  </Box>
);

const Grid = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[11]};
    margin-top: ${theme.spacing[8]};
  `}
`;
export default Data;
