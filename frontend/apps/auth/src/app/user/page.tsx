import getCustomAppearance from '@onefootprint/appearance/src/utils/get-custom-appearance/get-custom-appearance'; /** Importing 'getCustomAppearance' from '@onefootprint/appearance' fails in server components */
import dynamic from 'next/dynamic';

import ClientProviders from '../client-providers';
import Loading from './loading';

const AuthMethodsApp = dynamic(() => import('@/src/components/auth-methods-app'), {
  ssr: false,
  loading: () => <Loading isRoot />,
});

type UserPageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

const variant = 'modal';
const UserPage = async (props: UserPageProps) => {
  const { searchParams } = props;
  const loadedStyle = await getCustomAppearance({
    strategy: ['queryParameters'],
    obConfig: searchParams?.public_key,
    params: searchParams,
    variant,
  });

  return (
    <main id="__next" data-variant={loadedStyle.variant}>
      <ClientProviders loadedStyle={loadedStyle}>
        <AuthMethodsApp variant={variant} Loading={<Loading />} />
      </ClientProviders>
    </main>
  );
};

export default UserPage;
