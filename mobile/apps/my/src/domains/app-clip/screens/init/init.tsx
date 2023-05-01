import { D2PStatusUpdate } from '@onefootprint/types';
import { Container, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';
import useParseHandoffUrl from './hooks/use-parse-handoff-url';

export type InitProps = {
  onSuccess: (authToken: string) => void;
  onError: () => void;
};

const Init = ({ onSuccess, onError }) => {
  const updateD2PStatusMutation = useUpdateD2PStatus();

  useParseHandoffUrl({
    onSuccess: authToken => {
      updateD2PStatusMutation.mutate(
        { authToken, status: D2PStatusUpdate.inProgress },
        {
          onSuccess: () => {
            onSuccess(authToken);
          },
          onError,
        },
      );
    },
    onError,
  });

  return (
    <Container center>
      <LoadingIndicator />
    </Container>
  );
};

export default Init;
