import { Box, Button, Dialog, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

type PermissionsDialogProps = {
  onContinue: () => void;
  children: React.ReactNode;
};

const PermissionsDialog = ({
  children,
  onContinue,
}: PermissionsDialogProps) => {
  const { t } = useTranslation(
    'components.scan.doc-selection.permissions-dialog',
  );
  const [open, setOpen] = useState(false);
  const [permissions, setPermission] = useState<CameraPermissionStatus | null>(
    null,
  );
  const isNonDetermined =
    permissions === 'not-determined' || permissions === 'denied';
  const analytics = useAnalytics();

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
      if (response === 'granted') {
        analytics.track(Events.DocCameraPermissionsGranted);
        onContinue();
      }
      if (response === 'denied') {
        analytics.track(Events.DocCameraPermissionsDenied);
      }
      // TODO: add fallback for denied, speciallly for android
    } catch (error) {}
  };

  const handleOpenSettings = () => {
    analytics.track(Events.DocCameraSettingsOpened);
    Linking.openSettings();
  };

  const handleClose = () => {
    analytics.track(Events.DocCameraPermissionsClosed);
    setOpen(false);
  };

  const handlePress = () => {
    analytics.track(Events.DocCameraPermissionsOpened);
    setOpen(true);
  };

  return permissions == null || permissions === 'granted' ? (
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
        <Typography variant="body-3" center>
          {t('description')}
        </Typography>
      </Dialog>
      <Button onPress={handlePress}>{t('cta')}</Button>
    </>
  );
};

export default PermissionsDialog;
