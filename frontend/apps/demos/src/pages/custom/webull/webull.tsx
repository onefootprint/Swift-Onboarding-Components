import { FootprintButton } from '@onefootprint/footprint-react';
import Head from 'next/head';
import React from 'react';

import Layout from './components/layout';
import { appearance, publicKey } from './webull.constants';

const Webull = () => (
  <>
    <Head>
      <title>Footprint - Webull</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Layout>
      <FootprintButton
        appearance={appearance}
        publicKey={publicKey}
        onCompleted={(validationToken: string) => {
          console.log('on completed', validationToken);
        }}
        onCanceled={() => {
          console.log('user canceled!');
        }}
      />
    </Layout>
  </>
);

export default Webull;
