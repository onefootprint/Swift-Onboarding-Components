import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createGlobalStyle, css } from 'styled-components';
import Providers from '../components/providers';

// Don't enable log rocket until we know we are in a live onboarding
Logger.init('handoff', /* deferSessionRecord */ true);
const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = Source_Code_Pro({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  // https://developer.apple.com/documentation/app_clips/supporting_invocations_from_your_website_and_the_messages_app
  const shouldShowAppClipSmartBanner = router.pathname.includes('/appclip');

  return (
    <>
      {shouldShowAppClipSmartBanner ? (
        <Head>
          <meta
            name="apple-itunes-app"
            content="app-id=1632436468, app-clip-bundle-id=com.onefootprint.my.Clip, app-clip-display=card"
          />
        </Head>
      ) : null}
      <Providers pageProps={pageProps}>
        <GlobalStyle />
        <Component {...pageProps} />
      </Providers>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      height: 100%;
      font-family: ${defaultFont.style.fontFamily};
      --font-family-default: ${defaultFont.style.fontFamily};
      --font-family-code: ${codeFont.style.fontFamily};
    }

    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
      height: 100%;
    }

    #__next {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  `}`;

export default App;
