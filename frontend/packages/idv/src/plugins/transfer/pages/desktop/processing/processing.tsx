import React from 'react';
import { useTranslation } from 'react-i18next';

import useGetD2PStatus from '../../../../../hooks/api/hosted/onboarding/d2p/use-get-d2p-status';
import { useDesktopMachine } from '../../../components/desktop-machine-provider';
import ProcessingBase from '../../../components/processing';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useCancelD2P from '../../../hooks/use-cancel-d2p';
import useRequirementsTitle from '../../../hooks/use-requirements-title-translation-key';

const Processing = () => {
  const [state, send] = useDesktopMachine();
  const { scopedAuthToken, missingRequirements } = state.context;
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.pages.desktop.processing',
  });
  const cancelD2P = useCancelD2P({
    authToken: scopedAuthToken,
    onSuccess: () => {
      send({ type: 'd2pSessionCanceled' });
    },
    onError: () => {
      send({
        type: 'd2pSessionExpired',
      });
    },
  });
  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: handleSuccess,
      onError: handleError,
    },
  });
  const { title } = useRequirementsTitle(missingRequirements);

  return (
    <ProcessingBase
      title={title}
      subtitle={t('subtitle')}
      cta={t('cancel')}
      onCancel={cancelD2P}
    />
  );
};

export default Processing;
