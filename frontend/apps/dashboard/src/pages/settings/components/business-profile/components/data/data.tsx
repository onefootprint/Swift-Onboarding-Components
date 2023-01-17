import { Organization } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import Avatar from './components/logo';
import Name from './components/name';
import Website from './components/website';

type DataProps = {
  organization: Organization;
};

const Data = ({ organization }: DataProps) => (
  <div>
    <Avatar organization={organization} />
    <Grid>
      <Name value={organization.name} />
      <Website value={organization.websiteUrl} />
    </Grid>
  </div>
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
