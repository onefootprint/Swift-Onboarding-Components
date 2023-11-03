import getCustomAppearance from '@onefootprint/appearance';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import type { GetServerSideProps } from 'next';
import React, { Suspense } from 'react';

const Content = React.lazy(() => import('./components/content'));

const Auth = () => (
  <ObserveCollectorProvider appName="component-auth">
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  </ObserveCollectorProvider>
);

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
