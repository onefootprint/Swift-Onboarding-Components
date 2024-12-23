'use client';

import type { DIMetadata } from '@/idv/types';
import type { InitArgs } from '../../identify.types';
import type { DoneArgs } from '../../identify.types';
import Router from './components/router';
import { type IdentifyContext, IdentifyMachineProvider } from './state';

export type LoginInitialArgs = Omit<InitArgs, 'bootstrapData' | 'initialAuthToken'> & {
  email?: DIMetadata<string>;
  phoneNumber?: DIMetadata<string>;
  identify: IdentifyContext;
};

type IdentifyLoginProps = {
  onDone: (args: DoneArgs) => void;
  onBack?: () => void;
  handleReset?: () => void;
  machineArgs: LoginInitialArgs;
};

/** The legacy identify flow. Capable of handling either signups or logins, but we will soon deprecate its ability to handle signup flows. */
const Identify = ({ onDone, onBack, handleReset, machineArgs }: IdentifyLoginProps): JSX.Element | null => (
  <IdentifyMachineProvider args={machineArgs}>
    <Router onDone={onDone} onBack={onBack} handleReset={handleReset} />
  </IdentifyMachineProvider>
);

export default Identify;
