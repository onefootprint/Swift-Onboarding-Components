import { useFootprintProvider } from '@onefootprint/footprint-elements';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

const AuthenticationSuccess = () => {
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const { authToken } = state.context;

  const emitTokenAndClose = (validationToken: string) => {
    footprint.complete({ validationToken });
  };

  if (authToken) {
    emitTokenAndClose(authToken);
    return <LoadingIndicator />;
  }

  // TODO: Create edge case errors screen
  // In theory this should not happen, but it's cover do cover
  // https://linear.app/footprint/issue/FP-566/create-edge-case-erro-scree-s
  return <div />;
};

export default AuthenticationSuccess;
