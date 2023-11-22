import type { GetSdkArgsResponse } from '@onefootprint/types';
import { Container, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import useSdkArgs from './hooks/use-sdk-args';

type InitProps = {
  authToken: string;
  onDone: (response: { data?: GetSdkArgsResponse; error?: unknown }) => void;
};

const Init = ({ authToken, onDone }: InitProps) => {
  useSdkArgs(authToken, {
    onSuccess: data => {
      onDone({ data });
    },
    onError: error => {
      onDone({ error });
    },
  });

  return (
    <Container center>
      <LoadingIndicator />
    </Container>
  );
};

export default Init;
