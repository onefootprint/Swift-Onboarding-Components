import { Stack, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Form from './components/form';
import Illustration from './components/illustration';
import NavigationBar from './components/navigation-bar';

type MockupScreenProps = {
  $borderRadius: string;
  $backgroundColor: string;
};

const MockupScreen = ({ $borderRadius, $backgroundColor }: MockupScreenProps) => (
  <Container direction="column" position="relative">
    <NavigationBar />
    <MainScreen>
      <Illustration />
      <Form $borderRadius={$borderRadius} $backgroundColor={$backgroundColor} />
    </MainScreen>
  </Container>
);

const Container = styled(Stack)`
  width: 100%;
  min-height: fit-content;
  margin: auto;

  ${media.greaterThan('md')`
    max-width: 85%;
  `}
`;

const MainScreen = styled(Stack)`
  ${({ theme }) => css`
    min-height: 420px;
    height: 100%;
    flex-direction: column;
    border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-top: none;

    ${media.greaterThan('md')`
      flex-direction: row;
      aspect-ratio: 16 / 9;
    `}
  `}
`;

export default MockupScreen;
