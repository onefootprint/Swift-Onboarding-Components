import '../static/globals.css';

import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import { COMMIT_SHA, DEPLOYMENT_URL, GOOGLE_MAPS_KEY } from '../config/constants';

type RootLayoutProps = {
  children: React.ReactNode;
  params?: Record<string, string>; // eslint-disable-line react/no-unused-prop-types
};

const DMSans = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  weight: ['400', '500', '700'],
});

const mapsSrc = GOOGLE_MAPS_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`
  : undefined;

export const metadata: Metadata = {
  title: 'Footprint Auth',
  applicationName: 'Auth',
  keywords: ['Auth', 'Authentication', 'Footprint'],
  other: {
    'app-commit-sha': String(COMMIT_SHA),
    'app-deployment-url': String(DEPLOYMENT_URL),
  },
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" className={DMSans.variable}>
    <head>
      <link rel="shortcut icon" href="/favicon.ico" />
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
      <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
    </head>
    <body style={{ backgroundColor: 'inherit' }}>{children}</body>
    {mapsSrc ? <Script src={mapsSrc} strategy="lazyOnload" /> : null}
  </html>
);

export default RootLayout;
