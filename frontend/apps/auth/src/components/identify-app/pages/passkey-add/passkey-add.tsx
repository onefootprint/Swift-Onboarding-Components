import type { DeviceInfo } from '@onefootprint/idv';
import { createHandoffUrlAuth, useGenerateScopedAuthToken } from '@onefootprint/idv';
import { Box, Button } from '@onefootprint/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

type PasskeyAddProps = {
  authToken: string;
  device: DeviceInfo;
  onSkip: () => void;
  onError?: (error: unknown) => void;
  onNewTabOpened?: (tab: Window) => void;
  onScopedAuthTokenGenerated: (token: string) => void;
};

const PasskeyAdd = ({
  authToken,
  device,
  onSkip,
  onError,
  onNewTabOpened,
  onScopedAuthTokenGenerated,
}: PasskeyAddProps) => {
  const { t, i18n } = useTranslation('common');
  const retryScopedToken = useRef(3);
  const [scopedAuthToken, setScopedAuthToken] = useState<string>('');
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  const url = createHandoffUrlAuth({ authToken: scopedAuthToken, language: i18n.language });
  const urlStr = url?.toString();

  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken({
    authToken,
    device,
    onError: (error: unknown) => {
      onError?.(error);
      if (retryScopedToken.current > 0) {
        generateScopedAuthToken();
        retryScopedToken.current -= 1;
      }
    },
    onSuccess: ({ authToken }) => {
      setScopedAuthToken(authToken);
      onScopedAuthTokenGenerated(authToken);
    },
  });

  const isLoading = mutation.isPending || !urlStr || !scopedAuthToken;

  const handleAddPassKeyClick = () => {
    if (!urlStr) return;

    // Open new window on desktop, new tab on mobile
    const tab = window.open(
      urlStr,
      '_blank',
      !isMobile
        ? 'height=800px,width=600px,location=no,menubar=no,status=no,toolbar=no,left=100px,top=100px'
        : undefined,
    );
    if (tab) {
      onNewTabOpened?.(tab);
    } else {
      onError?.(new Error('Could not open new tab'));
    }
  };

  return (
    <Notification title={`${t('add-a-passkey')}`} subtitle={t('passkey-subtitle-suggestion')}>
      <Box display="flex" flexDirection="column" gap={4} paddingTop={7} paddingBottom={2} alignItems="center">
        <Button onClick={handleAddPassKeyClick} fullWidth size="large" disabled={isLoading}>
          {t('launch-registration')}
        </Button>
        <Button onClick={onSkip} fullWidth size="large" variant="secondary">
          {t('do-later')}
        </Button>
      </Box>
    </Notification>
  );
};

export default PasskeyAdd;
