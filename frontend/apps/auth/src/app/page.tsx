import { type FootprintVariant } from '@onefootprint/footprint-js';
import React from 'react';

import DrawerLoading from '@/src/components/loading/drawer-loading';
import ModalLoading from '@/src/components/loading/modal-loading';
import { getCustomAppearanceFork } from '@/src/package-appearance';

import IdentifyApp from '../components/identify-app';
import AppProviders from './app-providers';

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
  const loadedStyle = await getCustomAppearanceFork({
    strategy: ['queryParameters', 'obConfig'],
    obConfig: searchParams?.public_key,
    params: searchParams,
    variant,
  });

  return (
    <main id="__next" data-variant={loadedStyle.variant}>
      <AppProviders loadedStyle={loadedStyle}>
        <IdentifyApp variant={variant} fallback={<LoadingComponent />} />
      </AppProviders>
    </main>
  );
};

export default AppPage;
