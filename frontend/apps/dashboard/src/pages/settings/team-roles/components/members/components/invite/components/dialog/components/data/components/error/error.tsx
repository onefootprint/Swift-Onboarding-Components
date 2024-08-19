import { IcoWarning16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type ErrorProps = {
  children: React.ReactNode;
};

const ErrorComponent = ({ children }: ErrorProps) => (
  <Container>
    <IcoWarning16 color="error" />
    <Text variant="body-3" color="error">
      {children}
    </Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    margin-top: ${theme.spacing[7]};
  `}
`;

export default ErrorComponent;
