import React from 'react';

import { DesktopMachineProvider } from './components/desktop-machine-provider';
import { MobileMachineProvider } from './components/mobile-machine-provider';
import DesktopApp from './desktop-app';
import MobileApp from './mobile-app';
import type { TransferProps } from './types';

const AppWithMachine = ({ context, onDone }: TransferProps) => {
  const { device } = context;
  if (device.type === 'mobile') {
    return (
      <MobileMachineProvider>
        <MobileApp context={context} onDone={onDone} />
      </MobileMachineProvider>
    );
  }
  return (
    <DesktopMachineProvider>
      <DesktopApp context={context} onDone={onDone} />
    </DesktopMachineProvider>
  );
};

export default AppWithMachine;
