import { Wrapper, mockRequest } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import { MachineProvider } from '../../components/machine-provider';
import type { InitMachineArgs } from '../../utils/state-machine/machine';

export const getCustomWrapper = (initialContext: InitMachineArgs) => {
  const initWrapper = ({ children }: { children: React.ReactNode }) => (
    <MachineProvider initialContext={initialContext}>
      <Wrapper>{children}</Wrapper>
    </MachineProvider>
  );

  return initWrapper;
};

export const withUserVault = () => {
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withUserVaultError = (errorString?: string) => {
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    statusCode: 400,
    response: {
      // TODO update
      error: {
        message: errorString ?? {
          [IdDI.addressLine1]: 'Invalid addr line 1',
          [IdDI.state]: 'Invalid state',
        },
      },
      message: errorString,
    },
  });
};
