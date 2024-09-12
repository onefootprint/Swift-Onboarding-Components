import OnboardingMachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { OnboardingProps } from './types';

const Onboarding = ({ onDone, l10n, ...args }: OnboardingProps) => (
  <OnboardingMachineProvider args={args} l10n={l10n}>
    <Router onDone={onDone} />
  </OnboardingMachineProvider>
);

export default Onboarding;
