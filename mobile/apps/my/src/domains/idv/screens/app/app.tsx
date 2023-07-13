import themes from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import createTheme from '@/utils/create-theme';

import Error from '../error';
import Router from '../router';
import useAuthToken from './hooks/use-auth-token';
import useStyleParams from './hooks/use-style-params';

type AppProps = {
  linkingUrl?: string;
  onLoad: () => void;
};

const App = ({ linkingUrl, onLoad }: AppProps) => {
  const tokenQuery = useAuthToken(linkingUrl);
  const authToken = tokenQuery.data?.authToken;
  const styleQuery = useStyleParams(authToken);
  const styleParams = styleQuery.data;

  if (tokenQuery.isError) {
    return (
      <DesignSystemProvider theme={themes.light}>
        <Container onLayout={onLoad}>
          <Error />
        </Container>
      </DesignSystemProvider>
    );
  }
  if (authToken && styleQuery.isFetched) {
    const theme = createTheme(themes.light, styleParams);
    return (
      <DesignSystemProvider theme={theme}>
        <Container onLayout={onLoad}>
          <Router authToken={authToken} />
        </Container>
      </DesignSystemProvider>
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
