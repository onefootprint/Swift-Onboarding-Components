import type { ComponentProps } from 'react';

import AuthMethodsRouter from './components/router';
import type { AuthMethodsMachineState } from './state';
import { AuthMethodsMachineProvider } from './state';

type AuthMethodsProps = {
  authToken: string;
  initialMachineState?: AuthMethodsMachineState;
  Loading: JSX.Element;
  onDone: ComponentProps<typeof AuthMethodsRouter>['onDone'];
};

const AuthMethods = ({ authToken, initialMachineState, Loading, onDone }: AuthMethodsProps): JSX.Element => (
  <AuthMethodsMachineProvider args={{ authToken, initialMachineState }}>
    <AuthMethodsRouter onDone={onDone} Loading={Loading} />
  </AuthMethodsMachineProvider>
);

export default AuthMethods;
