import '@onefootprint/ui/styles.css';

import type { AppProps } from 'next/app';
import { DM_Mono, DM_Sans } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';
import Layout from '../components/layout';
import Providers from '../components/providers';
import '../styles/globals.css';

const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = DM_Mono({
  display: 'swap',
  preload: true,
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isResponsive = router.pathname === '/onboarding' || router.pathname.startsWith('/authentication');

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <Head>
        {isResponsive ? (
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        ) : (
          <meta name="viewport" content="width=900,maximum-scale=1.0" />
        )}
      </Head>
      <Providers>
        <GlobalStyle $hasMinWidth={!isResponsive} />
        <Layout name={pageProps.layout}>
          <Component />
        </Layout>
      </Providers>
    </>
  );
};

const GlobalStyle = createGlobalStyle<{ $hasMinWidth: boolean }>`
  ${({ theme, $hasMinWidth }) => css`
    :root {
      --side-nav-width: 240px;
      --main-content-max-width: 1200px;
      font-family: ${defaultFont.style.fontFamily};
      --font-family-default: ${defaultFont.style.fontFamily};
      --font-family-code: ${codeFont.style.fontFamily};
    }

    #__next {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    body {
      ${
        $hasMinWidth &&
        css`
        min-width: ${theme.grid.container.maxWidth.md}px;
      `
      }
    }
  `}
`;

export default App;
