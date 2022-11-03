import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption, TenantInfo } from '@onefootprint/types';
import React from 'react';

import bifrostMachine from '../../utils/state-machine/bifrost';
import { BifrostMachineProvider } from '../bifrost-machine-provider';
import SandboxBanner from './sandbox-banner';

describe('<SandboxBanner />', () => {
  const renderSandboxBanner = (options: { isLive: boolean }) => {
    const tenant: TenantInfo = {
      isLive: options.isLive,
      pk: 'key',
      name: 'tenant',
      mustCollectData: [CollectedKycDataOption.name],
      canAccessData: [CollectedKycDataOption.name],
      orgName: 'tenantOrg',
    };
    bifrostMachine.context.tenant = tenant;
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
