import React from 'react';

import OnboardingConfigMachineProvider from '../machine-provider';
import DialogContent from './components/dialog-content';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
};

const Dialog = ({ open, onClose }: DialogProps) =>
  open ? (
    <OnboardingConfigMachineProvider>
      <DialogContent onClose={onClose} />
    </OnboardingConfigMachineProvider>
  ) : null;

export default Dialog;
