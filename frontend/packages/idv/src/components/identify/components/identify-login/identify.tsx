'use client';

import type { DIMetadata } from '@/idv/types';
import type { InitArgs } from '../../identify.types';
import type { DoneArgs } from '../../identify.types';
import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';

export type LoginInitialArgs = Omit<InitArgs, 'bootstrapData'> & {
  email?: DIMetadata<string>;
  phoneNumber?: DIMetadata<string>;
};

type IdentifyLoginProps = {
  onDone: (args: DoneArgs) => void;
  onBack?: () => void;
  handleReset?: () => void;
  initialArgs: LoginInitialArgs;
};

/** The legacy identify flow. Capable of handling either signups or logins, but we will soon deprecate its ability to handle signup flows. */
const Identify = ({ onDone, onBack, handleReset, initialArgs }: IdentifyLoginProps): JSX.Element | null => (
  <IdentifyMachineProvider args={initialArgs}>
    <Router onDone={onDone} onBack={onBack} handleReset={handleReset} />
    <SandboxFooter />
  </IdentifyMachineProvider>
);

export default Identify;
