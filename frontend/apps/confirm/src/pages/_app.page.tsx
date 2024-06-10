import type { AppProps } from 'next/app';
import React from 'react';

import Providers from '../components/providers';

const App = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <Component {...pageProps} />
  </Providers>
);

export default App;
