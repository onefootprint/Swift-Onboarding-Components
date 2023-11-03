import styled, { css } from '@onefootprint/styled';
import type { Organization } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Id from './components/id';
import Logo from './components/logo';
import Name from './components/name';
import Website from './components/website';

type ContentProps = {
  organization: Organization;
};

const Content = ({ organization }: ContentProps) => (
  <Box testID="business-profile-data">
    <Logo organization={organization} />
    <Grid>
      <Name value={organization.name} />
      <Website value={organization.websiteUrl} />
      <Id value={organization.id} />
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

export default Content;
