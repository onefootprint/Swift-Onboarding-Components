import themes from '@onefootprint/design-tokens';
import styled, { css } from 'styled-components/native';
import { DesignSystemProvider } from '@onefootprint/ui';
import React, { useMemo } from 'react';

import createTheme from '@/utils/create-theme';

import AppContext from '../../components/app-context';
import Error from '../error';
import Router from '../router';
import useAuthToken from './hooks/use-auth-token';
import useHandoffMeta from './hooks/use-handoff-meta';

type AppProps = {
  linkingUrl?: string;
  onLoad: () => void;
};

const App = ({ linkingUrl, onLoad }: AppProps) => {
  const tokenQuery = useAuthToken(linkingUrl);
  const authToken = tokenQuery.data?.authToken;
  const handoffMetaQuery = useHandoffMeta(authToken);
  const appContextValue = useMemo(() => {
    return {
      sandboxIdDocOutcome: handoffMetaQuery.data?.sandboxIdDocOutcome ?? null,
    };
  }, [handoffMetaQuery.data?.sandboxIdDocOutcome]);

  if (tokenQuery.isError) {
    return (
      <DesignSystemProvider theme={themes.light}>
        <Container onLayout={onLoad}>
          <Error />
        </Container>
      </DesignSystemProvider>
    );
  }
  if (authToken && handoffMetaQuery.isFetched) {
    const theme = createTheme(themes.light, handoffMetaQuery.data?.styleParams);
    return (
      <AppContext.Provider value={appContextValue}>
        <DesignSystemProvider theme={theme}>
          <Container onLayout={onLoad}>
            <Router authToken={authToken} />
          </Container>
        </DesignSystemProvider>
      </AppContext.Provider>
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
