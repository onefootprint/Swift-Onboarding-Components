'use client';

import type {
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import React from 'react';

import type { DeviceInfo } from '../../hooks';
import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';
import type {
  IdentifyBootstrapData,
  IdentifyVariant,
  LogoConfig,
} from './state/types';
import type { DoneArgs } from './types';

type IdentifyProps = {
  config?: PublicOnboardingConfig;
  device: DeviceInfo;
  initialAuthToken?: string;
  isLive: boolean;
  logoConfig?: LogoConfig;
  obConfigAuth?: ObConfigAuth;
  onDone: (args: DoneArgs) => void;
  overallOutcome?: OverallOutcome;
  sandboxId?: string;
  bootstrapData?: IdentifyBootstrapData;
  variant: IdentifyVariant;
};

// TODO move this to its own package
const Identify = ({
  config,
  device,
  initialAuthToken,
  isLive,
  logoConfig,
  obConfigAuth,
  onDone,
  overallOutcome,
  sandboxId,
  bootstrapData,
  variant,
}: IdentifyProps): JSX.Element | null => (
  <IdentifyMachineProvider
    args={{
      bootstrapData,
      config,
      device,
      initialAuthToken,
      isLive,
      logoConfig,
      obConfigAuth,
      overallOutcome,
      sandboxId,
      variant,
    }}
  >
    <Router onDone={onDone} />
    <SandboxFooter />
  </IdentifyMachineProvider>
);

export default Identify;
