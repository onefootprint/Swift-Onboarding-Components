import { useOnboardingRequirementsMachine } from '../components/machine-provider';

export type { MachineContext } from '../../../utils/state-machine/onboarding-requirements/types';
export {
  Events,
  States,
} from '../../../utils/state-machine/onboarding-requirements/types';

export default useOnboardingRequirementsMachine;
