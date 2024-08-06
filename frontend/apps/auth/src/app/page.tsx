import getCustomAppearance from '@onefootprint/appearance/src/utils/get-custom-appearance/get-custom-appearance'; /** Importing 'getCustomAppearance' from '@onefootprint/appearance' fails in server components */
import type { FootprintVariant } from '@onefootprint/footprint-js';

import DrawerLoading from '@/src/components/client-loading/drawer-loading';
import ModalLoading from '@/src/components/client-loading/modal-loading';

import IdentifyApp from '../components/identify-app';
import ClientProviders from './client-providers';

type Fallback = (() => JSX.Element) | (() => null);
type AppPageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

const getLoadingComponent = (variant?: FootprintVariant): Fallback => {
  if (variant === 'modal') return ModalLoading;
  return variant === 'drawer' ? DrawerLoading : () => null;
};

const AppPage = async ({ searchParams }: AppPageProps) => {
  const variant = searchParams?.variant as FootprintVariant | undefined;
  const LoadingComponent = getLoadingComponent(variant);
  const loadedStyle = await getCustomAppearance({
    strategy: ['queryParameters', 'obConfig'],
    obConfig: searchParams?.public_key,
    params: searchParams,
    variant,
  });

  return (
    <main id="__next" data-variant={loadedStyle.variant}>
      <ClientProviders loadedStyle={loadedStyle}>
        <IdentifyApp variant={variant} fallback={<LoadingComponent />} />
      </ClientProviders>
    </main>
  );
};

export default AppPage;
