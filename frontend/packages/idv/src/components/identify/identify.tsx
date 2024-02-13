'use client';

import type { FootprintUserData } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React, { useState } from 'react';

import type { DeviceInfo } from '../../hooks';
import { useDeviceInfo } from '../../hooks';
import { getIdentifyBootstrapData } from '../../utils';
import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';
import type { IdentifyVariant, LogoConfig } from './state/types';
import type { DoneArgs, ObKeyHeader } from './types';

const initialDevice = {
  hasSupportForWebauthn: false,
  type: 'unknown',
  osName: 'unknown',
};

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

type IdentifyProps = {
  publicKey?: string;
  initialAuthToken?: string;
  config?: PublicOnboardingConfig;
  isLive: boolean;
  userData?: Pick<FootprintUserData, 'id.email' | 'id.phone_number'>;
  logoConfig?: LogoConfig;
  variant: IdentifyVariant;
  onDone: (args: DoneArgs) => void;
  // TODO eventually include the requested scope
};

const Identify = ({
  publicKey,
  initialAuthToken,
  config,
  isLive,
  userData,
  logoConfig,
  variant,
  onDone,
}: IdentifyProps): JSX.Element | null => {
  const [device, setDevice] = useState<DeviceInfo>(initialDevice);

  const obConfigAuth = getOnboardConfigurationKey(publicKey);

  useDeviceInfo(setDevice);

  return (
    <IdentifyMachineProvider
      args={{
        initialAuthToken,
        bootstrapData: getIdentifyBootstrapData(userData),
        config,
        isLive,
        device,
        obConfigAuth,
        logoConfig,
        variant,
      }}
    >
      <Router onDone={onDone} />
      <SandboxFooter />
    </IdentifyMachineProvider>
  );
};

export default Identify;
