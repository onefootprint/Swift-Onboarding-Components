import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionHeaderProps = {
  title: string;
};

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <>
    <Header>
      <Typography as="h2" variant="label-1">
        {title}
      </Typography>
    </Header>
    <StyledDivider />
  </>
);

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

export default SectionHeader;
