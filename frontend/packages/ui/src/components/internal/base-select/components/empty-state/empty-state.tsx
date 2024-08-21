import type React from 'react';
import styled, { css } from 'styled-components';

import Text from '../../../../text';

type EmptyStateProps = {
  children: React.ReactNode;
};

const EmptyState = ({ children }: EmptyStateProps) => (
  <EmptyStateContainer>
    <Text variant="body-3" color="tertiary">
      {children}
    </Text>
  </EmptyStateContainer>
);

const EmptyStateContainer = styled.div`
  ${({ theme }) => css`
    text-align: left;
    margin: ${theme.spacing[3]} ${theme.spacing[5]} ${theme.spacing[3]} 0;
  `}
`;

export default EmptyState;
