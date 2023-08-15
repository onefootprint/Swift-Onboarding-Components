import React from 'react';

import Router from './components/router';
import PlaybookMachineProvider from './machine-provider';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
};

const Dialog = ({ open, onClose }: DialogProps) =>
  open ? (
    <PlaybookMachineProvider>
      <Router onClose={onClose} />
    </PlaybookMachineProvider>
  ) : null;

export default Dialog;
