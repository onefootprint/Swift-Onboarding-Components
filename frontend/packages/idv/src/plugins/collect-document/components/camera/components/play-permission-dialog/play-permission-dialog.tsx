import { Dialog, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type PlayPermissionDialogProps = {
  open?: boolean;
  hide: () => void;
  onAllow: () => void;
};

const PlayPermissionDialog = ({ open, hide, onAllow }: PlayPermissionDialogProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.camera.play-permission-dialog',
  });

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
      <Text variant="body-2" color="secondary" textAlign="center">
        {t('description')}
      </Text>
    </Dialog>
  );
};

export default PlayPermissionDialog;
