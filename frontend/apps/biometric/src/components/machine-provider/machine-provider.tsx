import { useMachine } from '@xstate/react';
import constate from 'constate';
import { biometricMachine } from 'src/utils/state-machine';

const useLocalBiometricMachine = () => useMachine(biometricMachine);

export const [BiometricMachineProvider, useBiometricMachine] = constate(
  useLocalBiometricMachine,
);

export default BiometricMachineProvider;
