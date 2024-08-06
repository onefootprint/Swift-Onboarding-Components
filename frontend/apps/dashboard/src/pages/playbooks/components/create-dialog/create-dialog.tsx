import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Router from './components/router';

export type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const CreateDialog = ({ open, onClose, onCreate }: CreateDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog',
  });

  return (
    <Dialog size="full-screen" onClose={onClose} open={open} title={t('title')}>
      <Router onCreate={onCreate} />
    </Dialog>
  );
};

export default CreateDialog;
