import { Box, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

export type SectionHeaderProps = {
  children?: React.ReactNode;
  subtitle: string;
  title: string;
};

const SectionHeader = ({ children, subtitle, title }: SectionHeaderProps) => (
  <Header>
    <Box>
      <Text variant="label-1" tag="h3" marginBottom={1}>
        {title}
      </Text>
      <Text variant="body-3" color="secondary">
        {subtitle}
      </Text>
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
