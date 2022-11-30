import { IS_DEV, IS_PREVIEW } from '@onefootprint/global-constants';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const shouldShow = IS_PREVIEW || IS_DEV;

const DynamicDevTools = dynamic(() => import('../dev-tools-button'), {
  ssr: false,
});

const DevTools = () =>
  shouldShow ? (
    <Suspense fallback="Loading...">
      <DynamicDevTools />
    </Suspense>
  ) : null;

export default DevTools;
