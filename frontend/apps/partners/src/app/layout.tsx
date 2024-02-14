import './app.css';

import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import React from 'react';

import ClientProviders from '@/components/client-providers';
import { COMMIT_SHA, DEPLOYMENT_URL } from '@/config/constants';

const DMSans = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Footprint Auth',
  applicationName: 'Auth',
  keywords: ['Auth', 'Authentication', 'Footprint'],
  other: {
    'app-commit-sha': String(COMMIT_SHA),
    'app-deployment-url': String(DEPLOYMENT_URL),
  },
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en" className={DMSans.variable}>
    <head>
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        href="/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link
        href="/favicon-32x32.png"
        rel="icon"
        sizes="32x32"
        type="image/png"
      />
      <link
        href="/favicon-16x16.png"
        rel="icon"
        sizes="16x16"
        type="image/png"
      />
    </head>
    <body>
      <ClientProviders>{children}</ClientProviders>
    </body>
  </html>
);

export default RootLayout;
