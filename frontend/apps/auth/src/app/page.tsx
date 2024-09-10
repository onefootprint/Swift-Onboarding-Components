import getCustomAppearance from '@onefootprint/appearance/src/utils/get-custom-appearance/get-custom-appearance'; /** Importing 'getCustomAppearance' from '@onefootprint/appearance' fails in server components */
import type { FootprintVariant } from '@onefootprint/footprint-js';
import dynamic from 'next/dynamic';

import ModalLoading from '@/src/components/client-loading/modal-loading';

import ClientProviders from './client-providers';

const IdentifyApp = dynamic(() => import('@/src/components/identify-app'), {
  ssr: false,
  loading: () => <ModalLoading />,
});

type AppPageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

const AppPage = async ({ searchParams }: AppPageProps) => {
  const variant = searchParams?.variant as FootprintVariant | undefined;
  const loadedStyle = await getCustomAppearance({
    strategy: ['queryParameters', 'obConfig'],
    obConfig: searchParams?.public_key,
    params: searchParams,
    variant,
  });

  return (
    <main id="__next" data-variant={loadedStyle.variant}>
      <ClientProviders loadedStyle={loadedStyle}>
        <IdentifyApp variant={variant} />
      </ClientProviders>
    </main>
  );
};

export default AppPage;
