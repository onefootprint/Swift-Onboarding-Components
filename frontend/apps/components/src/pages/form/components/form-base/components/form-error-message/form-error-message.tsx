import { IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type FormErrorMessageProps = {
  text?: string;
};

const FormErrorMessage = ({ text }: FormErrorMessageProps) => {
  if (!text) {
    return null;
  }

  return (
    <Container>
      <IcoWarning16 color="error" />
      <Typography variant="body-3" color="error">
        {text}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

export default FormErrorMessage;
