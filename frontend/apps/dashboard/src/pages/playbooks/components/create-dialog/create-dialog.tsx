import { Dialog } from '@onefootprint/ui';
import React from 'react';
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
    <Dialog size="full-screen" open={open} title={t('title')} onClose={onClose}>
      <Router onCreate={onCreate} />
    </Dialog>
  );
};

export default CreateDialog;
