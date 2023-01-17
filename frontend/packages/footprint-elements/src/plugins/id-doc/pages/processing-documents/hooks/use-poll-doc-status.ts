import { DocStatusKind, GetDocStatusResponse } from '@onefootprint/types';
import { useState } from 'react';

import useGetDocStatus from './use-get-doc-status';

const usePollDocStatus = (
  options: {
    onSuccess?: (response: GetDocStatusResponse) => void;
    onError?: (error: unknown) => void;
  } = {},
) => {
  const [enabled, setEnabled] = useState(false);

  const start = () => {
    setEnabled(true);
  };

  const stop = () => {
    setEnabled(false);
  };

  // Stop polling when we get a a non-pending status or error out
  const result = useGetDocStatus(enabled, {
    onSuccess: (response: GetDocStatusResponse) => {
      const {
        status: { kind },
      } = response;
      if (kind === DocStatusKind.pending) {
        return; // Keep polling
      }

      stop();
      options.onSuccess?.(response);
    },
    onError: error => {
      stop();
      options.onError?.(error);
    },
  });

  return { start, stop, result };
};

export default usePollDocStatus;
