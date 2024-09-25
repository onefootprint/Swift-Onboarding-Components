import { Dialog } from '@onefootprint/ui';
import noop from 'lodash/noop';
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
  const { t } = useTranslation('entity-details');
  const decryptControls = useDecryptControls();

  const handleSubmit = (reason: string) => {
    decryptControls.submitReason(reason);
    onSubmit();
  };

  return (
    <Dialog
      size="compact"
      title={t('decrypt.start')}
      headerIcon={{ onClick: loading ? noop : onClose }}
      onClose={loading ? noop : onClose}
      open={open}
      primaryButton={{
        form: 'decrypt-reason-form',
        label: t('decrypt.decrypt'),
        loading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: onClose,
        disabled: loading,
      }}
    >
      <ReasonForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ReasonDialog;
