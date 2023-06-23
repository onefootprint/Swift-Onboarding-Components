import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type WarningProps = {
  children: string;
};

const Warning = ({ children }: WarningProps) => {
  return (
    <Container>
      <Typography variant="caption-3" color="quinary">
        {children}
      </Typography>
    </Container>
  );
};

const Container = styled.View`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: ${theme.spacing[6]};
    z-index: 1;
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Warning;
