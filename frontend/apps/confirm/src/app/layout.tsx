import { cx } from 'class-variance-authority';
import type { Metadata } from 'next';
import { DM_Mono, DM_Sans } from 'next/font/google';
import type React from 'react';
import Providers from '../components/providers';
import { COMMIT_SHA, DEPLOYMENT_URL } from '../config/constants';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Footprint - Confirm',
  applicationName: 'Confirm',
  keywords: ['Confirm', 'Footprint'],
  other: {
    'app-commit-sha': COMMIT_SHA,
    'app-deployment-url': DEPLOYMENT_URL,
  },
};
const defaultFont = DM_Sans({ subsets: ['latin'], variable: '--font-family-default' });

const codeFont = DM_Mono({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-family-code' });

const RootLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <html lang="en">
      <body className={cx(defaultFont.className, codeFont.variable, 'bg-primary')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
