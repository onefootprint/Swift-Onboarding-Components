import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import bifrostMachine from '../../utils/state-machine/bifrost';
import { BifrostMachineProvider } from '../bifrost-machine-provider';
import SandboxBanner from './sandbox-banner';

describe('<SandboxBanner />', () => {
  const renderSandboxBanner = (options: { isLive: boolean }) => {
    bifrostMachine.context.tenant.isLive = options.isLive;
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
