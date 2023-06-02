import { Box, Button, Dialog } from '@onefootprint/ui';
import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

type PermissionsDialogProps = {
  children: React.ReactNode;
};

const PermissionsDialog = ({ children }: PermissionsDialogProps) => {
  const { t } = useTranslation(
    'components.scan.doc-selection.permissions-dialog',
  );
  const [open, setOpen] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const handleAskPermission = async () => {
    try {
      const response = await requestPermission();
      if (response.granted) {
        setOpen(false);
      }
    } catch (error) {}
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePress = () => {
    setOpen(true);
  };

  const cta = permission?.canAskAgain
    ? {
        label: t('continue'),
        onPress: handleAskPermission,
      }
    : {
        label: t('open-settings'),
        onPress: handleOpenSettings,
      };

  return permission && permission.granted ? (
    <Box>{children}</Box>
  ) : (
    <>
      <Dialog title={t('title')} open={open} onClose={handleClose} cta={cta}>
        {t('description')}
      </Dialog>
      <Button onPress={handlePress}>{t('cta')}</Button>
    </>
  );
};

export default PermissionsDialog;
