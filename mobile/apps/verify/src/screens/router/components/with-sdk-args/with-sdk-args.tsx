import { Container, LoadingIndicator } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import useCreateSdkArgs from './hooks/use-create-sdk-args';

type WithSdkArgsProps = {
  children: (token: string) => React.ReactNode;
};

// This is a component for testing porpuses only
// The idea is that the swift sdk will make this request and provide the token to the react native app
const WithSdkArgs = ({ children }: WithSdkArgsProps) => {
  const sdkArgsMutation = useCreateSdkArgs();

  useEffect(() => {
    sdkArgsMutation.mutate({
      data: { publicKey: 'pb_test_LibqMUbHu920QbOH250jTE' },
      kind: 'verify_v1',
    });
  }, []);

  if (sdkArgsMutation.isLoading) {
    <Container center>
      <LoadingIndicator />
    </Container>;
  }

  if (sdkArgsMutation.data) {
    const { token } = sdkArgsMutation.data;
    return <View>{children(token)}</View>;
  }

  return null;
};

export default WithSdkArgs;
