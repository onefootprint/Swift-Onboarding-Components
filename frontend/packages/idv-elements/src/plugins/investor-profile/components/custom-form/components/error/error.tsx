import { IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  label: string;
};

const Error = ({ label }: ErrorProps) => (
  <Container>
    <IcoWarning16 color="error" />
    <Typography variant="body-3" color="error">
      {label}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

export default Error;
