import {
  IS_CI,
  IS_E2E,
  IS_PROD,
  IS_SERVER,
  IS_TEST,
} from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import Script from 'next/script';
import React from 'react';

import nid from '../../utils/neuro-id';

const NID_LIVE_SITE_NAME = 'humor717';
const NID_DEV_SITE_NAME = 'humor717-test';

const IS_DISABLED_BY_ENV = IS_SERVER || IS_TEST || IS_E2E || IS_CI;

type LoadNeuroIdProps = {
  config?: PublicOnboardingConfig;
};

const LoadNeuroId = ({ config }: LoadNeuroIdProps) => {
  const isEnabled = !IS_DISABLED_BY_ENV && config?.nidEnabled;
  const siteName =
    IS_PROD && config?.isLive ? NID_LIVE_SITE_NAME : NID_DEV_SITE_NAME;

  return isEnabled ? (
    <Script
      id="neuro-id-script"
      onError={e => console.error('Failed to load the Neuro-ID script', e)}
      src={`//scripts.neuro-id.com/c/nid-${siteName}.js`}
      strategy="afterInteractive"
      onLoad={() => {
        if (config.orgId) {
          nid.setVariable('funnel', config.orgId);
        }
      }}
    />
  ) : null;
};

export default LoadNeuroId;
