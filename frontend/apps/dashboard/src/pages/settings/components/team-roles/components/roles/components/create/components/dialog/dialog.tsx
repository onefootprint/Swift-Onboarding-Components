import { useTranslation } from '@onefootprint/hooks';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React from 'react';

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open }: DialogProps) => {
  const { t } = useTranslation('pages.settings.roles.create');

  return (
    <FPDialog
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'role-create-form',
        label: 'Invite',
        type: 'submit',
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div>content</div>
    </FPDialog>
  );
};

export default Dialog;
