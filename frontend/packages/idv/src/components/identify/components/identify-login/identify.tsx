'use client';

import type { InitArgs } from '../../identify.types';
import type { DoneArgs } from '../../identify.types';
import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';

type IdentifyProps = {
  onDone: (args: DoneArgs) => void;
  initialArgs: InitArgs;
};

/** The legacy identify flow. Capable of handling either signups or logins, but we will soon deprecate its ability to handle signup flows. */
const Identify = ({ onDone, initialArgs }: IdentifyProps): JSX.Element | null => (
  <IdentifyMachineProvider args={initialArgs}>
    <Router onDone={onDone} />
    <SandboxFooter />
  </IdentifyMachineProvider>
);

export default Identify;
