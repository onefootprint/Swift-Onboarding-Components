import { useTranslation } from '@onefootprint/hooks';
import { Dialog, Typography } from '@onefootprint/ui';
import React from 'react';

type PlayPermissionDialogProps = {
  open?: boolean;
  hide: () => void;
  onAllow: () => void;
};

const PlayPermissionDialog = ({
  open,
  hide,
  onAllow,
}: PlayPermissionDialogProps) => {
  const { t } = useTranslation(
    'id-doc.components.camera.play-permission-dialog',
  );

  return (
    <Dialog
      open={!!open}
      title={t('title')}
      onClose={hide}
      size="compact"
      primaryButton={{
        label: t('cta'),
        onClick: onAllow,
      }}
      isConfirmation
      disableResponsiveness
    >
      <Typography
        variant="body-2"
        color="secondary"
        sx={{ textAlign: 'center' }}
      >
        {t('description')}
      </Typography>
    </Dialog>
  );
};

export default PlayPermissionDialog;
