'use client';

import type { FootprintUserData } from '@onefootprint/footprint-js';
import type { DeviceInfo } from '@onefootprint/idv';
import {
  getIdentifyBootstrapData,
  getRandomID,
  useDeviceInfo,
} from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DoneArgs, ObKeyHeader } from '@/src/types';
import { sandboxIdEditRules } from '@/src/utils';

import DashedLine from './components/dashed-line';
import Router from './components/router';
import SandboxInput from './components/sandbox-input';
import SandboxOutcomeFooter from './components/sandbox-outcome-footer';
import { IdentifyMachineProvider } from './state';

const voidObj: Record<string, never> = {};
const initialDevice = {
  hasSupportForWebauthn: false,
  type: 'unknown',
  osName: 'unknown',
};

const RenderNull = (): null => null;

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

type IdentifyProps = {
  publicKey?: string;
  authToken?: string;
  config: PublicOnboardingConfig;
  userData?: Pick<FootprintUserData, 'id.email' | 'id.phone_number'>;
  showLogo?: boolean;
  onDone: (args: DoneArgs) => void;
};

const Identify = ({
  publicKey,
  authToken,
  config,
  userData,
  showLogo,
  onDone,
}: IdentifyProps): JSX.Element | null => {
  const [device, setDevice] = useState<DeviceInfo>(initialDevice);
  const [sandboxId, setSandboxId] = useState<string>(() => getRandomID(13));

  const { t } = useTranslation('common');
  const obConfigAuth = getOnboardConfigurationKey(publicKey);
  const isSandbox = !config?.isLive;

  useDeviceInfo(setDevice);

  const isSandboxEditable = useMemo(
    () => sandboxIdEditRules(userData || voidObj),
    [userData],
  );

  return (
    <IdentifyMachineProvider
      args={{
        authToken,
        bootstrapData: getIdentifyBootstrapData(userData),
        config,
        device,
        obConfigAuth,
        sandboxId,
        showLogo,
      }}
    >
      <Router onDone={onDone}>
        {isSandbox
          ? (state, send) =>
              isSandboxEditable(state) ? (
                <>
                  <DashedLine variant="secondary" />
                  <SandboxInput
                    label={t('sandbox.label')}
                    placeholder={t('sandbox.placeholder')}
                    value={sandboxId}
                    setValue={value => {
                      setSandboxId(value);
                      send({
                        type: 'sandboxIdChanged',
                        payload: { sandboxId: value },
                      });
                    }}
                    texts={{
                      copy: t('sandbox.button.copy'),
                      copyConfirmation: t('sandbox.button.copy-confirmation'),
                      description: t('sandbox.description'),
                      edit: t('sandbox.button.edit'),
                      reset: t('sandbox.button.reset'),
                      save: t('sandbox.button.save'),
                    }}
                  />
                </>
              ) : (
                <SandboxOutcomeFooter
                  label={t('sandbox.label')}
                  sandboxId={sandboxId}
                />
              )
          : RenderNull}
      </Router>
    </IdentifyMachineProvider>
  );
};

export default Identify;
