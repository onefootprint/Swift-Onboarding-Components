import React from 'react';

import CreateDialog from './components/dialog';
import { OnboardingConfigMachineProvider } from './components/machine-provider';

export type CreateProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const Create = ({ open, onClose, onCreate }: CreateProps) => (
  <OnboardingConfigMachineProvider>
    <CreateDialog open={open} onClose={onClose} onCreate={onCreate} />
  </OnboardingConfigMachineProvider>
);

export default Create;
