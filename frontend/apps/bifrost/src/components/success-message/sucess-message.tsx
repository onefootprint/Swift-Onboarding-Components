import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled';
import { Box, LinkButton } from 'ui';

export type SuccessMessageProps = {
  body: React.ReactNode;
};

const SuccessMessage = ({ body }: SuccessMessageProps) => (
  <Container>
    <Box>
      <HeaderTitle
        title="You&#39;re all set! 😎"
        subtitle="Identity successfully verified"
      />
    </Box>
    {body}
    <LinkButton>Return to site</LinkButton>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default SuccessMessage;
