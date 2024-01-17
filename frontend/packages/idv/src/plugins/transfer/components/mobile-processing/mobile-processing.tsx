import { D2PStatus } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useGetD2PStatus } from '../../../../hooks';
import useHandleD2PStatusUpdate from '../../hooks/mobile/use-handle-d2p-status-update';
import useCancelD2P from '../../hooks/use-cancel-d2p';
import getRequirementsTitleTranslationKey from '../../utils/get-requirements-title-translation-key';
import { useMobileMachine } from '../mobile-machine-provider';
import Processing from '../processing';

type MobileProcessingProps = {
  translationKey: string;
};

const MobileProcessing = ({ translationKey }: MobileProcessingProps) => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, missingRequirements, tab } = state.context;
  const { t } = useTranslation(translationKey);
  const allTKey = getRequirementsTitleTranslationKey(missingRequirements);

  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: response => {
        if (response.status === D2PStatus.canceled) {
          tab?.close();
          send({ type: 'tabClosed' });
        }
        handleSuccess(response);
      },
      onError: error => {
        tab?.close();
        handleError(error);
      },
    },
  });

  const cancelD2P = useCancelD2P({
    authToken: scopedAuthToken,
    onSuccess: () => {
      send({ type: 'd2pSessionCanceled' });
      tab?.close();
      send({ type: 'tabClosed' });
    },
    onError: () => {
      send({
        type: 'd2pSessionExpired',
      });
    },
  });

  return (
    <Processing
      title={t(allTKey)}
      subtitle={t('subtitle')}
      cta={t('cancel')}
      onCancel={cancelD2P}
    />
  );
};

export default MobileProcessing;
