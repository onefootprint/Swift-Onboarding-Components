import { getErrorMessage } from '@onefootprint/request';
import { D2PStatusUpdate } from '@onefootprint/types';

import { Logger } from '@/idv/utils';
import { useUpdateD2PStatus } from '../../queries';

const useCancelD2P = ({
  authToken,
  onSuccess,
  onError,
}: {
  authToken: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const updateD2PStatusMutation = useUpdateD2PStatus();

  return () => {
    if (!authToken || updateD2PStatusMutation.isPending) {
      return;
    }

    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess,
        onError: (error: unknown) => {
          Logger.error(`Failed to cancel D2P session from mobile bifrost. ${getErrorMessage(error)}`, {
            location: 'transfer',
          });
          onError?.();
        },
      },
    );
  };
};

export default useCancelD2P;
