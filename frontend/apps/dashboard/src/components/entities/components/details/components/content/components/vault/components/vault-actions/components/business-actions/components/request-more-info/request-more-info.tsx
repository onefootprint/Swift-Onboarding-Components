import type { TriggerResponse } from '@onefootprint/types';
import { useState } from 'react';
import ConfirmationDialog from './components/confirmation-dialog';
import FormDialog from './components/form-dialog';

export type RequestMoreInfoProps = {
  open: boolean;
  onClose: () => void;
};

const RequestMoreInfo = ({ open, onClose }: RequestMoreInfoProps) => {
  const [formSubmission, setFormSubmission] = useState<{
    bo: { id: string; hasPhone: boolean };
    action: TriggerResponse;
  } | null>(null);
  const showConfirmationDialog = !!formSubmission;

  const handleClose = () => {
    onClose();
    setFormSubmission(null);
  };

  return showConfirmationDialog ? (
    <ConfirmationDialog open={open} onClose={handleClose} bo={formSubmission.bo} action={formSubmission.action} />
  ) : (
    <FormDialog open={open} onClose={handleClose} onSubmit={setFormSubmission} />
  );
};

export default RequestMoreInfo;
