'use client';

import type { Variant } from '@/src/types';
import Layout from './layout';
import Router from './router';
import type { AuthIdentifyAppMachineArgs } from './state';
import { AuthIdentifyAppMachineProvider } from './state';

type IdentifyAppProps = AuthIdentifyAppMachineArgs & { variant?: Variant };

const IdentifyApp = ({ variant, ...args }: IdentifyAppProps): JSX.Element | null => {
  return (
    <AuthIdentifyAppMachineProvider args={args}>
      <Layout variant={variant}>
        <Router />
      </Layout>
    </AuthIdentifyAppMachineProvider>
  );
};

export default IdentifyApp;
