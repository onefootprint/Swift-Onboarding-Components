import { LoadFonts } from '@onefootprint/ui';
import type { DocumentContext } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { ServerStyleSheet } from 'styled-components';

import { COMMIT_SHA, DEPLOYMENT_URL } from '../config/constants';

const nextData = '__NEXT_DATA__';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
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
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  getPageProps() {
    return this.props[nextData].props.pageProps;
  }

  render() {
    const { variant, fontSrc, language } = this.getPageProps();

    return (
      <Html lang={language ?? 'en'}>
        <Head>
          <meta name="app-commit-sha" content={COMMIT_SHA} />
          <meta name="app-deployment-url" content={DEPLOYMENT_URL} />
          <meta charSet="utf-8" />
          <LoadFonts href={fontSrc} />
        </Head>
        <body data-variant={variant}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
