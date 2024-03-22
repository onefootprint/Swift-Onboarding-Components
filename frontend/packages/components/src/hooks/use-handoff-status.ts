import { D2PStatus } from '@onefootprint/types';
import { useEffect } from 'react';

import useFootprint from './use-footprint';
import useRequest from './use-request';

const useHandoffStatus = ({
  onCancel,
  onCompleted,
  onFailed,
  onStart,
}: {
  onCancel: () => void;
  onCompleted: () => void;
  onFailed: () => void;
  onStart: () => void;
}) => {
  const fp = useFootprint();
  const { scopedAuthToken } = fp.context;
  const d2pStatus = useRequest(fp.getD2PStatus);

  const pool = () => {
    d2pStatus.mutate(
      {},
      {
        onSuccess: response => {
          if (response.status === D2PStatus.waiting) {
            setTimeout(pool, 1000);
          }
          if (response.status === D2PStatus.canceled) {
            onCancel();
          }
          if (response.status === D2PStatus.failed) {
            onFailed();
          }
          if (response.status === D2PStatus.completed) {
            onCompleted();
          }
          if (response.status === D2PStatus.inProgress) {
            onStart?.();
            pool();
          }
        },
      },
    );
  };

  useEffect(() => {
    if (scopedAuthToken) {
      pool();
    }
  }, [scopedAuthToken]);

  return d2pStatus;
};

export default useHandoffStatus;
