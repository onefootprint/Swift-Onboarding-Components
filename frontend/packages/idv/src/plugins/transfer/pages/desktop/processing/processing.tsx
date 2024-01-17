import React from 'react';
import { useTranslation } from 'react-i18next';

import useGetD2PStatus from '../../../../../hooks/api/hosted/onboarding/d2p/use-get-d2p-status';
import { useDesktopMachine } from '../../../components/desktop-machine-provider';
import ProcessingBase from '../../../components/processing';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useCancelD2P from '../../../hooks/use-cancel-d2p';
import getRequirementsTitleTranslationKey from '../../../utils/get-requirements-title-translation-key';

const Processing = () => {
  const [state, send] = useDesktopMachine();
  const { scopedAuthToken, missingRequirements } = state.context;
  const { t } = useTranslation('idv');
  const allTKey = getRequirementsTitleTranslationKey(missingRequirements);
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

  return (
    <ProcessingBase
      title={t(allTKey)}
      subtitle={t('transfer.pages.desktop.processing.subtitle')}
      cta={t('transfer.pages.desktop.processing.cancel')}
      onCancel={cancelD2P}
    />
  );
};

export default Processing;
