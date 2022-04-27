import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { LoadFonts } from 'ui';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <LoadFonts />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
