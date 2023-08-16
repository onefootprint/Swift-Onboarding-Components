import { useTranslation } from '@onefootprint/hooks';
import { Dialog as FpDialog } from '@onefootprint/ui';
import React from 'react';

import Router from './components/router';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
};

const Dialog = ({ open, onClose }: DialogProps) => {
  const { t } = useTranslation('pages.playbooks.dialog');

  return (
    <FpDialog
      size="full-screen"
      onClose={onClose}
      open={open}
      title={t('title')}
    >
      <Router onClose={onClose} />
    </FpDialog>
  );
};

export default Dialog;
