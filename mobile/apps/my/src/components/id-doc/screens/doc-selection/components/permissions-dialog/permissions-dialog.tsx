import { Box, Button, Dialog, Typography } from '@onefootprint/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import type { CameraPermissionStatus } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

type PermissionsDialogProps = {
  onGranted: () => void;
  children: React.ReactNode;
};

const PermissionsDialog = ({ children, onGranted }: PermissionsDialogProps) => {
  const { t } = useTranslation('scan.doc-selection.permissions-dialog');
  const [open, setOpen] = useState(false);
  const [permissions, setPermission] = useState<CameraPermissionStatus | null>(null);
  const isDenied = permissions === 'denied';
  const analytics = useAnalytics();
  const isAndroid = Platform.OS === 'android';
  const [androidCameraPermissionPromptDenied, setAndroidCameraPermissionPromptDenied] = useState(false);
  const shouldPromptAndroidCameraPermission = isAndroid && !androidCameraPermissionPromptDenied;

  const checkPermissions = useCallback(async () => {
    try {
      if (isAndroid) {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPermission) {
          return 'granted';
        }
        return 'denied';
      }
      const newPermissions = await Camera.getCameraPermissionStatus();
      return newPermissions;
    } catch (_) {
      return null;
    }
  }, [isAndroid]);

  useEffect(() => {
    const setInitialPermissions = async () => {
      const newPermissions = await checkPermissions();
      setPermission(newPermissions);
    };
    setInitialPermissions();
  }, [checkPermissions]);

  const handleAskPermission = async () => {
    try {
      const response = await Camera.requestCameraPermission();
      setPermission(response);

      if (response === 'denied' && isAndroid) {
        setAndroidCameraPermissionPromptDenied(true);
      }

      if (response === 'granted') {
        analytics.track(Events.DocCameraPermissionsGranted);
        setOpen(false);
        onGranted();
      }
      if (response === 'denied') {
        analytics.track(Events.DocCameraPermissionsDenied);
      }
    } catch (_) {
      // do nothing
    }
  };

  const handleOpenSettings = () => {
    handleClose();
    analytics.track(Events.DocCameraSettingsOpened);
    Linking.openSettings();
  };

  const handleClose = () => {
    analytics.track(Events.DocCameraPermissionsClosed);
    setOpen(false);
  };

  const handlePress = async () => {
    // In case user upadates the permission from settings, we don't have the information updated in our component
    // So we need to check the permission again
    const newPermissions = await checkPermissions();
    if (newPermissions === 'granted') {
      analytics.track(Events.DocCameraPermissionsGranted);
      onGranted();
    } else {
      analytics.track(Events.DocCameraPermissionsOpened);
      setOpen(true);
    }
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
          isDenied && !shouldPromptAndroidCameraPermission
            ? {
                label: t('open-settings'),
                onPress: handleOpenSettings,
              }
            : {
                label: t('continue'),
                onPress: handleAskPermission,
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
