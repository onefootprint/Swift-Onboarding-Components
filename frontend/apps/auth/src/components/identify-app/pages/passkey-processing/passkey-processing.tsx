import { useCancelD2P } from '@onefootprint/idv';
import { Box, LinkButton, LoadingSpinner } from '@onefootprint/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';
import { useAuthIdentifyAppMachine } from '../../state';

import { useGetD2PStatus } from '@onefootprint/idv';
import { D2PStatus } from '@onefootprint/types';

type PasskeyProcessingProps = {
  onCancelError?: (error: unknown) => void;
};

const PasskeyProcessing = ({ onCancelError }: PasskeyProcessingProps) => {
  const { t } = useTranslation('common');
  const [state, send] = useAuthIdentifyAppMachine();
  const d2dStatus = useRef<D2PStatus | undefined>();
  const { passkeyRegistrationWindow, scopedAuthToken = '' } = state.context;

  const handlePasskeyCancelled = () => {
    send({ type: 'passkeyProcessingCancelled' });
    passkeyRegistrationWindow?.close();
  };

  const handleCancelD2p = useCancelD2P({
    authToken: scopedAuthToken,
    onError: () => onCancelError?.(new Error('Could not cancel D2P session')),
    onSuccess: handlePasskeyCancelled,
  });

  useGetD2PStatus({
    authToken: scopedAuthToken,
    options: {
      onError: handlePasskeyCancelled,
      onSuccess: ({ status }) => {
        d2dStatus.current = status;
        if (status === D2PStatus.canceled) {
          return handlePasskeyCancelled();
        }

        if (status === D2PStatus.completed) {
          return send({ type: 'passkeyProcessingCompleted' });
        }

        if (status === D2PStatus.failed) {
          return send({ type: 'passkeyProcessingError' });
        }
      },
    },
  });

  /* Check if the handoff tab is closed and cancel the D2P session */
  useEffect(() => {
    if (!passkeyRegistrationWindow || passkeyRegistrationWindow?.closed) return;

    let checkInterval: NodeJS.Timeout;
    window.setInterval(() => {
      if (passkeyRegistrationWindow.closed) {
        window.clearInterval(checkInterval);
        if (d2dStatus.current === D2PStatus.canceled || d2dStatus.current === D2PStatus.completed) return;
        handleCancelD2p();
      }
    }, 1000);

    return () => window.clearInterval(checkInterval);
  }, [passkeyRegistrationWindow?.closed, d2dStatus.current]);

  return (
    <Notification title={t('add-a-passkey')} subtitle={t('passkey-tab-instructions')}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <LoadingSpinner />
        <LinkButton onClick={handleCancelD2p} data-dd-action-name="transfer-processing:cancel">
          {t('cancel')}
        </LinkButton>
      </Box>
    </Notification>
  );
};

export default PasskeyProcessing;
