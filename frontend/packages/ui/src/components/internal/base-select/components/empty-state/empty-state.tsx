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
    margin: ${theme.spacing[3]}px ${theme.spacing[5]}px ${theme.spacing[3]}px 0;
  `}
`;

export default EmptyState;
