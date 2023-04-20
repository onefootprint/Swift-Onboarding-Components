import { D2PStatusUpdate } from '@onefootprint/types';
import React from 'react';
import { Text } from 'react-native';

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

  return <Text>AppClip</Text>;
};

export default Init;
