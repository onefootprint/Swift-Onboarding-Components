import { Dialog } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateDialog = ({ open, onClose, onCreate }: CreateDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.lists.dialog',
  });

  return (
    <Dialog onClose={onClose} open={open} title={t('title')}>
      {/* TODO: implement */}
      <div>TODO</div>
    </Dialog>
  );
};

export default CreateDialog;
