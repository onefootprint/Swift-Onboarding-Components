import { getHostedBusinessesOptions } from '@onefootprint/axios';
import type { HostedBusiness } from '@onefootprint/request-types';
import type { CreateBusinessOnboardingRequirement, OverallOutcome } from '@onefootprint/types';
import { Box, Shimmer, Stack } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { BootstrapBusinessData, BootstrapUserData } from '../../types';
import type { CommonIdvContext } from '../../utils/state-machine';
import BusinessSelector from './components/business-selector';
import NewBusinessIntroduction from './components/new-business-introduction';
import type { SharedState } from './create-business-onboarding.types';
import useStartBusinessOnboarding from './hooks/use-start-business-onboarding';

type CreateBusinessOnboardingProps = {
  context: {
    bootstrapBusinessData: BootstrapBusinessData;
    bootstrapUserData: BootstrapUserData;
    overallOutcome?: OverallOutcome;
    requirement: CreateBusinessOnboardingRequirement;
  };
  idvContext: CommonIdvContext;
  onDone: () => void;
  onError: (error: unknown) => void;
};

const CreateBusinessOnboarding = ({ idvContext, context, onDone, onError }: CreateBusinessOnboardingProps) => {
  const { authToken } = idvContext;
  const {
    requirement: { requiresBusinessSelection },
    overallOutcome: kybFixtureResult,
    bootstrapUserData,
    bootstrapBusinessData,
  } = context;

  const [shouldShowIntroduction, setShowIntroduction] = useState(false);
  const startOnboardingMutation = useStartBusinessOnboarding(
    authToken,
    { bootstrapUserData, bootstrapBusinessData },
    onError,
  );
  const startOnboarding = (inheritBusinessId?: string) => {
    startOnboardingMutation.mutate(
      { body: { inheritBusinessId, kybFixtureResult } },
      {
        onSuccess: ({ isNewBusiness }) => {
          if (isNewBusiness) {
            setShowIntroduction(true);
          } else {
            onDone();
          }
        },
      },
    );
  };

  const sharedState = {
    authToken,
    startOnboarding,
    isLoading: startOnboardingMutation.isPending,
  };
  if (shouldShowIntroduction) {
    return <NewBusinessIntroduction onDone={onDone} />;
  }
  if (requiresBusinessSelection) {
    return <BusinessSelectionContent state={sharedState} />;
  }
  return <StartOnboardingWithoutSelection state={sharedState} />;
};

const StartOnboardingWithoutSelection = ({ state }: { state: SharedState }) => {
  const { startOnboarding } = state;

  useEffect(() => {
    startOnboarding();
  }, []);

  return <Loading />;
};

const BusinessSelectionContent = ({
  state,
}: {
  state: SharedState;
}) => {
  const businessesQuery = useQuery({
    ...getHostedBusinessesOptions({
      headers: { 'X-Fp-Authorization': state.authToken },
    }),
  });
  if (businessesQuery.isPending) {
    return <Loading />;
  }
  if (businessesQuery.data && businessesQuery.data.length === 0) {
    return <StartOnboardingWithoutSelection state={state} />;
  }
  if (businessesQuery.data && businessesQuery.data.length > 0) {
    return <BusinessSelectionFlow state={state} businesses={businessesQuery.data} />;
  }
  return null;
};

const BusinessSelectionFlow = ({
  businesses,
  state: { startOnboarding, isLoading },
}: { businesses: HostedBusiness[]; state: SharedState }) => {
  const handleSelectBusiness = (businessId: string) => {
    startOnboarding(businessId);
  };

  const handleStartNewBusiness = async () => {
    startOnboarding();
  };

  return (
    <BusinessSelector
      businesses={businesses}
      onAddNew={handleStartNewBusiness}
      onSelect={handleSelectBusiness}
      isBusy={isLoading}
    />
  );
};

const Loading = () => (
  <Box>
    <Box width="100%" height="var(--navigation-header-height)" />
    <Stack flexDirection="column" justifyContent="center" alignItems="center" marginBottom={8}>
      <Shimmer height="28px" width="272px" marginBottom={5} />
      <Shimmer height="70px" width="340px" />
    </Stack>
    <Box marginBottom={5}>
      <Shimmer height="202px" width="100%" />
    </Box>
  </Box>
);

export default CreateBusinessOnboarding;
