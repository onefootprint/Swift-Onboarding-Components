import React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../../../../typography';

type EmptyStateProps = {
  children: React.ReactNode;
};

const EmptyState = ({ children }: EmptyStateProps) => (
  <EmptyStateContainer>
    <Typography variant="body-3" color="tertiary">
      {children}
    </Typography>
  </EmptyStateContainer>
);

const EmptyStateContainer = styled.div`
  ${({ theme }) => css`
    text-align: left;
    margin: ${theme.spacing[3]} ${theme.spacing[5]} ${theme.spacing[3]} 0;
  `}
`;

export default EmptyState;
