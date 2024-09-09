import MachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { LivenessProps } from './types';

const AppWithMachine = ({ actionKind, idvContext, onDone, onCustomSkip }: LivenessProps) => (
  <MachineProvider initialContext={{ idvContext }}>
    <Router actionKind={actionKind} onDone={onDone} onCustomSkip={onCustomSkip} />
  </MachineProvider>
);
export default AppWithMachine;
