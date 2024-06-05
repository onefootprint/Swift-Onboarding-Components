import getCustomAppearance from '@onefootprint/appearance';
import { Logger } from '@onefootprint/idv';
import type { GetServerSideProps } from 'next';
import React, { Suspense } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import Content from './components/content';
import Loading from './components/loading';

const Form = () => {
  useEffectOnce(() => {
    Logger.enableLogRocket();
  });

  return (
    <Suspense fallback={<Loading />}>
      <Content fallback={<Loading />} />
    </Suspense>
  );
};

const FormWithProvider = () => <Form />;

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=15, stale-while-revalidate=3600',
  );

  const params = query as Record<string, string>;
  const { theme, fontSrc, rules, variant } = await getCustomAppearance({
    strategy: ['queryParameters'],
    params,
    variant: params.variant,
  });
  return { props: { theme, fontSrc, rules, variant } };
};

export default FormWithProvider;
