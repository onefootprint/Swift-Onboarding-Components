import MachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { LivenessProps } from './types';

const AppWithMachine = ({ idvContext, onDone }: LivenessProps) => (
  <MachineProvider initialContext={{ idvContext }}>
    <Router onDone={onDone} />
  </MachineProvider>
);
export default AppWithMachine;
