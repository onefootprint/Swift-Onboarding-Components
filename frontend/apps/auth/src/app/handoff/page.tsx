import getCustomAppearance from '@onefootprint/appearance/src/utils/get-custom-appearance/get-custom-appearance'; /** Importing 'getCustomAppearance' from '@onefootprint/appearance' fails in server components */
import dynamic from 'next/dynamic';

import ClientProviders from '../client-providers';

const PasskeyRegistrationApp = dynamic(() => import('@/src/components/passkey-registration-app'), { ssr: false });

type AuthHandoffPageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

const variant = 'modal';
const AuthHandoffPage = async (props: AuthHandoffPageProps) => {
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
        <PasskeyRegistrationApp variant={variant} />
      </ClientProviders>
    </main>
  );
};

export default AuthHandoffPage;
