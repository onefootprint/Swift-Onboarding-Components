import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type FeedbackProps = {
  children: string;
};

const Feedback = ({ children }: FeedbackProps) => {
  return (
    <Container>
      <Typography variant="label-4" color="quinary">
        {children}
      </Typography>
    </Container>
  );
};

const Container = styled.View`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.35);
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  `}
`;

export default Feedback;
