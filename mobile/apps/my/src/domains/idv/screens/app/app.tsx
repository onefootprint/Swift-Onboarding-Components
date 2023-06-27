import themes from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import { REVIEW_AUTH_TOKEN } from '@/config/constants';

import AppStoreReview from '../app-store-review';
import Error from '../error';
import Router from '../router';
import ThemeProvider from './components/theme-provider';
import useParseHandoffUrl from './hooks/use-parse-handoff-url';

type AppProps = {
  linkingUrl?: string;
  onLoad: () => void;
};

const App = ({ linkingUrl, onLoad }: AppProps) => {
  const { isError, data } = useParseHandoffUrl(linkingUrl);

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
          {data.authToken === REVIEW_AUTH_TOKEN ? (
            <AppStoreReview authToken={data.authToken} />
          ) : (
            <Router authToken={data.authToken} />
          )}
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
