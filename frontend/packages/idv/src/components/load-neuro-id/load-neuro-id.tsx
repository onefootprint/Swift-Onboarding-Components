import {
  IS_CI,
  IS_DEV,
  IS_E2E,
  IS_SERVER,
  IS_TEST,
  IS_VERCEL_PREVIEW,
} from '@onefootprint/global-constants';
import Script from 'next/script';
import React from 'react';

const SITE_NAME = IS_DEV || IS_VERCEL_PREVIEW ? 'humor717-test' : 'humor717';
const IS_DISABLED_BY_ENV = IS_SERVER || IS_TEST || IS_E2E || IS_CI;

type LoadNeuroIdProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

const LoadNeuroId = ({ children, disabled = false }: LoadNeuroIdProps) => {
  const isEnabled = !IS_DISABLED_BY_ENV && !disabled;

  return (
    <>
      {isEnabled && (
        <Script
          id="neuro-id-script"
          onError={e => console.error('Failed to load the Neuro-ID script', e)}
          src={`//scripts.neuro-id.com/c/nid-${SITE_NAME}.js`}
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
};

export default LoadNeuroId;
