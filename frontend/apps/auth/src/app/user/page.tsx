import dynamic from 'next/dynamic';
import React from 'react';

import { getCustomAppearanceFork } from '@/src/package-appearance';

import Loading from './loading';
import UserProviders from './user-providers';

type UserPageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

const variant = 'modal';
const UserContainer = dynamic(() => import('@/src/components/user-container'), {
  ssr: false,
  loading: () => <Loading isRoot />,
});

const UserPage = async (props: UserPageProps) => {
  const { searchParams } = props;
  const loadedStyle = await getCustomAppearanceFork({
    strategy: ['queryParameters'],
    obConfig: searchParams?.public_key,
    params: searchParams,
    variant,
  });

  return (
    <main id="__next" data-variant={loadedStyle.variant}>
      <UserProviders loadedStyle={loadedStyle}>
        <UserContainer variant={variant} Loading={<Loading />} />
      </UserProviders>
    </main>
  );
};

export default UserPage;
