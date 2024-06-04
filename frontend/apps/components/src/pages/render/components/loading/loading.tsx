import { Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Container data-testid="init-shimmer">
    <FieldContainer>
      <Label />
      <ValueContainer>
        <Value />
      </ValueContainer>
    </FieldContainer>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
  `}
`;

const FieldContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const ValueContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

const Label = () => <Shimmer width="80px" height="40px" />;

const Value = () => <Shimmer width="120px" height="40px" />;

export default Loading;
