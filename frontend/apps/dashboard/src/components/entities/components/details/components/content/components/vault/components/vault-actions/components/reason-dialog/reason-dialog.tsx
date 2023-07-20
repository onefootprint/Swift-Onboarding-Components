import { useTranslation } from '@onefootprint/hooks';
import { Dialog } from '@onefootprint/ui';
import noop from 'lodash/noop';
import React from 'react';

import useDecryptControls from '../../hooks/use-decrypt-controls';
import ReasonForm from './components/reason-form';

type ReasonDialogProps = {
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const ReasonDialog = ({
  open,
  loading,
  onClose,
  onSubmit,
}: ReasonDialogProps) => {
  const { t, allT } = useTranslation('pages.entity.decrypt');
  const decryptControls = useDecryptControls();

  const handleSubmit = (reason: string) => {
    decryptControls.submitReason(reason);
    onSubmit();
  };

  return (
    <Dialog
      size="compact"
      title={t('start')}
      primaryButton={{
        form: 'decrypt-reason-form',
        label: t('decrypt'),
        loading,
        type: 'submit',
      }}
      secondaryButton={{
        label: allT('cancel'),
        onClick: onClose,
        disabled: loading,
      }}
      headerIcon={{ onClick: loading ? noop : onClose }}
      onClose={loading ? noop : onClose}
      open={open}
    >
      <ReasonForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ReasonDialog;
