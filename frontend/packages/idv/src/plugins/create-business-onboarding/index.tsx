import type { CreateBusinessOnboardingRequirement, OverallOutcome } from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';
import SelectBusiness from './components/select-business';
import StartOnboardingWithoutSelection from './components/start-onboarding-without-selection';

type CreateBusinessOnboardingContext = {
  requirement: CreateBusinessOnboardingRequirement;
  overallOutcome?: OverallOutcome;
};

type CreateBusinessOnboardingProps = {
  context: CreateBusinessOnboardingContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

export type SharedState = {
  authToken: string;
  kybFixtureResult?: OverallOutcome;
  onDone: () => void;
};

const CreateBusinessOnboarding = ({ idvContext, context, onDone }: CreateBusinessOnboardingProps) => {
  const { authToken } = idvContext;
  const {
    requirement: { requiresBusinessSelection },
    overallOutcome: kybFixtureResult,
  } = context;

  const sharedState = {
    authToken,
    kybFixtureResult,
    onDone,
  };

  if (requiresBusinessSelection) {
    return <SelectBusiness state={sharedState} />;
  }
  return <StartOnboardingWithoutSelection state={sharedState} />;
};

export default CreateBusinessOnboarding;
