import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import CustomDesignSystemProvider from '../components/custom-design-system-provider';
import ErrorBoundary from '../components/error-boundary';
import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';
import ReactQueryProvider from '../config/initializers/react-query-provider';

configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isResponsive = router.pathname === '/onboarding';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=900,maximum-scale=1.0" />
      </Head>
      <ObserveCollectorProvider appName="dashboard">
        <CustomDesignSystemProvider>
          <ReactQueryProvider>
            <GlobalStyle hasMinWidth={!isResponsive} />
            <ErrorBoundary>
              <Layout name={pageProps.layout}>
                <Component />
              </Layout>
            </ErrorBoundary>
          </ReactQueryProvider>
        </CustomDesignSystemProvider>
      </ObserveCollectorProvider>
      <Analytics />
    </>
  );
};

const GlobalStyle = createGlobalStyle<{ hasMinWidth: boolean }>`
  ${({ theme, hasMinWidth }) => css`
    :root {
      --side-nav-width: 240px;
      --main-content-max-width: 1600px;
    }

    #__next {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    body {
      ${hasMinWidth &&
      css`
        min-width: ${theme.grid.container.maxWidth.md}px;
      `}
    }
  `}
`;

export default App;
