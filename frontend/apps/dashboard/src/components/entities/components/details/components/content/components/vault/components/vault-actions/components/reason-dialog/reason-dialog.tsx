import { Dialog } from '@onefootprint/ui';
import noop from 'lodash/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useDecryptControls from '../../hooks/use-decrypt-controls';
import ReasonForm from './components/reason-form';

type ReasonDialogProps = {
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const ReasonDialog = ({ open, loading, onClose, onSubmit }: ReasonDialogProps) => {
  const { t } = useTranslation('common');
  const decryptControls = useDecryptControls();

  const handleSubmit = (reason: string) => {
    decryptControls.submitReason(reason);
    onSubmit();
  };

  return (
    <Dialog
      size="compact"
      title={t('pages.entity.decrypt.start')}
      primaryButton={{
        form: 'decrypt-reason-form',
        label: t('pages.entity.decrypt.decrypt'),
        loading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cancel'),
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
