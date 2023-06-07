import { Box, Button, Dialog } from '@onefootprint/ui';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Camera } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

type PermissionsDialogProps = {
  children: React.ReactNode;
};

const PermissionsDialog = ({ children }: PermissionsDialogProps) => {
  const { t } = useTranslation(
    'components.scan.doc-selection.permissions-dialog',
  );
  const [open, setOpen] = useState(false);
  const [permissions, setPermission] = useState(null);
  const isNonDetermined = permissions === 'not-determined';

  const setInitialPermissions = async () => {
    try {
      const newPermissions = await Camera.getCameraPermissionStatus();
      setPermission(newPermissions);
    } catch (error) {}
  };

  useEffect(() => {
    setInitialPermissions();
  }, []);

  const handleAskPermission = async () => {
    try {
      const response = await Camera.requestCameraPermission();
      if (response === 'authorized') {
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

  return permissions == null || permissions === 'authorized' ? (
    <Box>{children}</Box>
  ) : (
    <>
      <Dialog
        title={t('title')}
        open={open}
        onClose={handleClose}
        cta={
          isNonDetermined
            ? {
                label: t('continue'),
                onPress: handleAskPermission,
              }
            : {
                label: t('open-settings'),
                onPress: handleOpenSettings,
              }
        }
      >
        {t('description')}
      </Dialog>
      <Button onPress={handlePress}>{t('cta')}</Button>
    </>
  );
};

export default PermissionsDialog;
