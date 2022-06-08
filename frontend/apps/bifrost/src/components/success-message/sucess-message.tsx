import React from 'react';
import CloseButton from 'src/components/close-button';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled-components';
import { Box, LinkButton, Portal } from 'ui';

export type SuccessMessageProps = {
  body: React.ReactNode;
};

const SuccessMessage = ({ body }: SuccessMessageProps) => (
  <Container>
    <Portal selector="#main-header" removeContent>
      <CloseButton />
    </Portal>
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
