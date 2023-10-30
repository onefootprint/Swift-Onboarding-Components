import { useTranslation } from '@onefootprint/hooks';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import Router from './components/router';

export type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const CreateDialog = ({ open, onClose, onCreate }: CreateDialogProps) => {
  const { t } = useTranslation('pages.playbooks.dialog');

  return (
    <Dialog size="full-screen" onClose={onClose} open={open} title={t('title')}>
      <Router onCreate={onCreate} />
    </Dialog>
  );
};

export default CreateDialog;
