import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type FeedbackProps = {
  children: string;
};

const Feedback = ({ children }: FeedbackProps) => (
  <Container>
    <Typography variant="caption-3" color="quinary">
      {children}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: ${theme.spacing[7]};
    z-index: 1;
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    text-align: center;
  `}
`;

export default Feedback;
