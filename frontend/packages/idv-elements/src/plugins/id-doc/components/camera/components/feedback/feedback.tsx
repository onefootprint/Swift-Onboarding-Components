import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type FeedbackProps = {
  children: string;
};

const Feedback = ({ children }: FeedbackProps) => (
  <Container>
    <FeedbackText>
      <Typography variant="label-4" color="quinary">
        {children}
      </Typography>
    </FeedbackText>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: ${theme.spacing[7]};
    width: 100%;
  `}
`;

const FeedbackText = styled.div`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]}
      ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    text-align: center;
  `}
`;

export default Feedback;
