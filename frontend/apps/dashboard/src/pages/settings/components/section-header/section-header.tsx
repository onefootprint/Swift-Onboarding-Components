import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type SectionHeaderProps = {
  title: string;
  subtitle: string;
};

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <Header>
    <Box>
      <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
        {title}
      </Typography>
      <Typography variant="body-3">{subtitle}</Typography>
    </Box>
  </Header>
);

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default SectionHeader;
