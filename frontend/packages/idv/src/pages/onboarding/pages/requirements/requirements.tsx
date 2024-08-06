import RequirementsMachineProvider from './components/machine-provider';
import Loading from './pages/loading';
import Router from './pages/router';
import type { OnboardingRequirementsMachineArgs } from './utils/state-machine';

type RequirementsProps = OnboardingRequirementsMachineArgs & {
  onDone: () => void;
};

const Requirements = ({ onDone, ...args }: RequirementsProps) => (
  <RequirementsMachineProvider args={args}>
    <Router onDone={onDone} />
    <Loading />
  </RequirementsMachineProvider>
);

export default Requirements;
