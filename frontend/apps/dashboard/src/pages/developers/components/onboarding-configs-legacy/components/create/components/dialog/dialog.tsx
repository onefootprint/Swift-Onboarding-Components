import React from 'react';

import DialogContent from '../dialog-content';
import OnboardingConfigMachineProvider from '../machine-provider';

export type DialogProps = {
  hideKyb?: boolean;
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const Dialog = ({ hideKyb, open, onClose, onCreate }: DialogProps) =>
  open ? (
    <OnboardingConfigMachineProvider>
      <DialogContent hideKyb={hideKyb} onClose={onClose} onCreate={onCreate} />
    </OnboardingConfigMachineProvider>
  ) : null;

export default Dialog;
