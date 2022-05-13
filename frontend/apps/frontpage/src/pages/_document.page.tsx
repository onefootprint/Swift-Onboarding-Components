/* eslint-disable react/jsx-props-no-spreading */
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React, { Fragment } from 'react';
import { ServerStyleSheet } from 'styled';
import { LoadFonts } from 'ui';

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [
          <Fragment key="styles">
            {initialProps.styles}
            {sheet.getStyleElement()}
          </Fragment>,
        ],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="robots" content="index,follow" />
          <meta
            name="description"
            content="The last identity verification you'll ever need"
          />
          <meta
            name="keywords"
            content="footprint,foot,print,id,onefootprint,identity,kyc,verify,security"
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://onefootprint.com" />
          <meta property="og:title" content="Footprint" />
          <meta
            property="og:description"
            content="The last identity verification you'll ever need"
          />
          <meta property="og:site_name" content="Footprint" />
          <meta property="og:locale" content="en_US" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="@onefootprintid" />
          <meta name="twitter:title" content="Footprint" />
          <meta
            name="twitter:description"
            content="The last identity verification you'll ever need"
          />
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
