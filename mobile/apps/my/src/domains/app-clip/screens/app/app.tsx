import themes from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import Error from '../error';
import Router from '../router';
import ThemeProvider from './components/theme-provider';
import useParseHandoffUrl from './hooks/use-parse-handoff-url';

type AppProps = {
  onLoad: () => void;
};

const App = ({ onLoad }: AppProps) => {
  const { isError, data } = useParseHandoffUrl();

  if (isError) {
    return (
      <DesignSystemProvider theme={themes.light}>
        <Container onLayout={onLoad}>
          <Error />
        </Container>
      </DesignSystemProvider>
    );
  }
  if (data) {
    return (
      <ThemeProvider authToken={data.authToken}>
        <Container onLayout={onLoad}>
          <Router authToken={data.authToken} />
        </Container>
      </ThemeProvider>
    );
  }
  return null;
};

const Container = styled.View`
  ${({ theme }) => css`
    flex: 1;
    background: ${theme.backgroundColor.primary};
  `}
`;

export default App;
