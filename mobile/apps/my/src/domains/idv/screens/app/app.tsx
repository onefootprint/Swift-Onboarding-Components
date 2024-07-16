import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import React, { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import styled, { css } from 'styled-components/native';

import configureReactI18next from '@/config/initializers/react-i18next';
import createTheme from '@/utils/create-theme';

import AppContext from '../../components/app-context';
import ErrorComponent from '../error';
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
  const language = handoffMetaQuery.data?.l10n?.language ?? 'en';

  if (tokenQuery.isError) {
    return (
      <I18nextProvider i18n={configureReactI18next(language)}>
        <DesignSystemProvider theme={themes.light}>
          <Container onLayout={onLoad}>
            <ErrorComponent />
          </Container>
        </DesignSystemProvider>
      </I18nextProvider>
    );
  }
  if (authToken && handoffMetaQuery.isFetched) {
    const theme = createTheme(themes.light, handoffMetaQuery.data?.styleParams);
    return (
      <AppContext.Provider value={appContextValue}>
        <I18nextProvider i18n={configureReactI18next(language)}>
          <DesignSystemProvider theme={theme}>
            <Container onLayout={onLoad}>
              <Router authToken={authToken} />
            </Container>
          </DesignSystemProvider>
        </I18nextProvider>
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
