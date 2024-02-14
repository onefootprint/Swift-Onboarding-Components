'use client';

import type { FootprintUserData } from '@onefootprint/footprint-js';
import type {
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import React from 'react';

import type { DeviceInfo } from '../../hooks';
import { getIdentifyBootstrapData } from '../../utils';
import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';
import type { IdentifyVariant, LogoConfig } from './state/types';
import type { DoneArgs } from './types';

type IdentifyProps = {
  obConfigAuth?: ObConfigAuth;
  initialAuthToken?: string;
  config?: PublicOnboardingConfig;
  device: DeviceInfo;
  isLive: boolean;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
  userData?: Pick<FootprintUserData, 'id.email' | 'id.phone_number'>;
  logoConfig?: LogoConfig;
  variant: IdentifyVariant;
  onDone: (args: DoneArgs) => void;
};

// Should we move this to its own package?
const Identify = ({
  obConfigAuth,
  initialAuthToken,
  config,
  device,
  isLive,
  sandboxId,
  overallOutcome,
  userData,
  logoConfig,
  variant,
  onDone,
}: IdentifyProps): JSX.Element | null => (
  <IdentifyMachineProvider
    args={{
      initialAuthToken,
      bootstrapData: getIdentifyBootstrapData(userData),
      config,
      isLive,
      sandboxId,
      overallOutcome,
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

export default Identify;
