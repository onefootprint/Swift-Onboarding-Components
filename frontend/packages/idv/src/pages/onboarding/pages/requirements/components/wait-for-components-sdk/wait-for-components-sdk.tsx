import { CreateUserTokenScope } from '@onefootprint/types/src/api/create-user-token';

import useEffectOnceStrict from '../../../../../../components/identify/hooks/use-effect-once-strict';
import { Logger } from '../../../../../../utils';
import { useOnboardingRequirementsMachine } from '../machine-provider';
import useCreateToken from './hooks/use-create-token';

type WaitForComponentsProps = {
  onDone: () => void;
};

const WaitForComponentsSdk = ({ onDone }: WaitForComponentsProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext: { authToken, componentsSdkContext },
  } = state.context;
  const useCreateTokenMutation = useCreateToken();

  useEffectOnceStrict(() => {
    if (!componentsSdkContext) {
      Logger.error('Reached WaitForComponentsSdk while componentsSdkContext is null');
      onDone();
      return () => undefined;
    }

    // First, register a listener to wait for the components SDK to tell us it is done
    const destructor = componentsSdkContext.onRelayFromComponents(onDone);
    // Then, generate an auth token that has limited permissions for use by the components SDK.
    // We will then pass it back to the components SDK
    useCreateTokenMutation.mutate(
      {
        authToken,
        requestedScope: CreateUserTokenScope.onboardingComponents,
      },
      {
        onSuccess: ({ token }) => {
          // TODO e2e test that this token doesn't have advanced scopes
          // Pass the scoped auth token back to the components SDK to handle any requirements it pleases
          componentsSdkContext.relayToComponents({ vaultingToken: token, authToken });
        },
        onError: () => {
          send('error');
        },
      },
    );
    return destructor;
  });

  return null;
};

export default WaitForComponentsSdk;
