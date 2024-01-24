import { D2PStatus } from '@onefootprint/types';
import React from 'react';

import { useGetD2PStatus } from '../../../../hooks';
import useHandleD2PStatusUpdate from '../../hooks/mobile/use-handle-d2p-status-update';
import useCancelD2P from '../../hooks/use-cancel-d2p';
import { useMobileMachine } from '../mobile-machine-provider';
import Processing from '../processing';

type MobileProcessingProps = {
  title: string;
  subtitle: string;
  cta: string;
};

const MobileProcessing = ({ title, subtitle, cta }: MobileProcessingProps) => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab } = state.context;

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
      title={title}
      subtitle={subtitle}
      cta={cta}
      onCancel={cancelD2P}
    />
  );
};

export default MobileProcessing;
