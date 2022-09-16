import noop from 'lodash/noop';
import React from 'react';
import { Dialog } from 'ui';

import { Event } from '../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../decrypt-machine-provider';
import ReasonForm from './components/reason-form';

type DecryptReasonDialogProps = {
  loading: boolean;
  open: boolean;
  onClose: () => void;
};

const DecryptReasonDialog = ({
  open,
  loading,
  onClose,
}: DecryptReasonDialogProps) => {
  const [, send] = useDecryptMachine();

  const handleSubmit = (reason: string) => {
    send(Event.submittedReason, { payload: { reason } });
  };

  return (
    <Dialog
      size="compact"
      title="Decrypt data"
      primaryButton={{
        form: 'decrypt-reason-form',
        label: 'Continue',
        loading,
        type: 'submit',
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
        disabled: loading,
      }}
      onClose={loading ? noop : onClose}
      open={open}
    >
      <ReasonForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default DecryptReasonDialog;
