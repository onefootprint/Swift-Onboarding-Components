import { useEffect } from 'react';
import type { SharedState } from '..';
import Loading from '../../collect-kyb-data/components/loading';
import useBusinessOnboarding from '../hooks/use-business-onboarding';

/** No business selection is required since one is already associated with this session. So, all we have to do is initiate the business onboarding. */
const StartOnboardingWithoutSelection = ({ state }: { state: SharedState }) => {
  const { authToken, kybFixtureResult, onDone } = state;

  const useBusinessOnboardingMutation = useBusinessOnboarding({ authToken, kybFixtureResult });
  useEffect(() => {
    useBusinessOnboardingMutation.mutate({}, { onSuccess: onDone });
  }, []);
  return <Loading />;
};

export default StartOnboardingWithoutSelection;
