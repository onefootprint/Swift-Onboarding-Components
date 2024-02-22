import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type SectionHeaderProps = {
  children?: React.ReactNode;
  subtitle: string;
  title: string;
};

const SectionHeader = ({ children, subtitle, title }: SectionHeaderProps) => (
  <Header>
    <Box>
      <Typography variant="label-1" as="h3" sx={{ marginBottom: 1 }}>
        {title}
      </Typography>
      <Typography variant="body-3" color="secondary">
        {subtitle}
      </Typography>
    </Box>
    {children}
  </Header>
);

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default SectionHeader;
