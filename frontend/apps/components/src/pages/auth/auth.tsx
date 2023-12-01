import getCustomAppearance from '@onefootprint/appearance';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Logger } from '@onefootprint/idv-elements';
import type { FootprintAppearance } from '@onefootprint/types';
import type { GetServerSideProps } from 'next';
import React, { Suspense } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import DrawerLoading from './components/loading/drawer-loading';
import ModalLoading from './components/loading/modal-loading';

type Fallback = (() => JSX.Element) | (() => null);

const AuthContainer = React.lazy(() => import('./components/auth-container'));

const getLoadingComponent = (v?: FootprintVariant): Fallback => {
  if (v === 'modal') return ModalLoading;
  return v === 'drawer' ? DrawerLoading : () => null;
};

const Auth = ({ variant }: FootprintAppearance) => {
  const Loading = getLoadingComponent(variant);
  useEffectOnce(() => {
    Logger.setupLogRocket('auth');
  });

  return (
    <ObserveCollectorProvider appName="component-auth">
      <Suspense fallback={<Loading />}>
        <AuthContainer variant={variant} fallback={<Loading />} />
      </Suspense>
    </ObserveCollectorProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=3600',
  );

  const obConfig = query.public_key as string | undefined;
  const params = query as Record<string, string>;
  const response = await getCustomAppearance({
    strategy: ['queryParameters', 'obConfig'],
    obConfig,
    params,
    variant: params.variant,
  });
  return { props: response };
};

export default Auth;
