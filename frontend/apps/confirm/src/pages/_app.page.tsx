import type { AppProps } from 'next/app';

import { DM_Mono, DM_Sans } from 'next/font/google';
import { createGlobalStyle } from 'styled-components';
import Providers from '../components/providers';

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
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <GlobalStyle />
    <Component {...pageProps} />
  </Providers>
);

const GlobalStyle = createGlobalStyle`
 :root {
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
  }
`;

export default App;
