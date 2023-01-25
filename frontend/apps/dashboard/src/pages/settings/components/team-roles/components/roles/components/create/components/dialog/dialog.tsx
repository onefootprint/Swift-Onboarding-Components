import { useTranslation } from '@onefootprint/hooks';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React from 'react';

import Form from './components/form';

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open }: DialogProps) => {
  const { t, allT } = useTranslation('pages.settings.roles.create');

  const handleSubmit = () => {
    onClose();
  };

  return (
    <FPDialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'role-create-form',
        label: allT('create'),
        type: 'submit',
      }}
      secondaryButton={{
        label: allT('cancel'),
        onClick: onClose,
      }}
    >
      <Form onSubmit={handleSubmit} />
    </FPDialog>
  );
};

export default Dialog;
