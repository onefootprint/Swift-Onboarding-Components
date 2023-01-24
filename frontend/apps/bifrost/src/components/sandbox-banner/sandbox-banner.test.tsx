import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';
import React from 'react';

import bifrostMachine from '../../utils/state-machine/bifrost';
import { BifrostMachineProvider } from '../bifrost-machine-provider';
import SandboxBanner from './sandbox-banner';

describe('<SandboxBanner />', () => {
  const renderSandboxBanner = (options: { isLive: boolean }) => {
    const config: OnboardingConfig = {
      createdAt: 'date',
      id: 'id',
      isLive: options.isLive,
      key: 'key',
      logoUrl: 'url',
      privacyPolicyUrl: 'url',
      name: 'tenant',
      orgName: 'tenantOrg',
      status: 'enabled',
      mustCollectData: [CollectedKycDataOption.name],
      mustCollectIdentityDocument: false,
      mustCollectSelfie: false,
      canAccessData: [CollectedKycDataOption.name],
      canAccessIdentityDocumentImages: false,
      canAccessSelfieImage: false,
    };

    bifrostMachine.context.config = config;
    customRender(
      <BifrostMachineProvider>
        <SandboxBanner />
      </BifrostMachineProvider>,
    );
  };

  describe('when it is using a live key', () => {
    it('should render nothing', () => {
      renderSandboxBanner({ isLive: true });
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should render a banner', () => {
      renderSandboxBanner({ isLive: false });
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
