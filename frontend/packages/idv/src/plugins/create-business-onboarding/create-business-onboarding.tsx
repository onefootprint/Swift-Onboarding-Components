import { getHostedBusinessesOptions, postHostedBusinessOnboardingMutation } from '@onefootprint/axios';
import type { HostedBusiness } from '@onefootprint/request-types';
import type { CreateBusinessOnboardingRequirement, OverallOutcome } from '@onefootprint/types';
import { Box, Shimmer, Stack } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { CommonIdvContext } from '../../utils/state-machine';
import BusinessSelector from './components/business-selector';
import NewBusinessIntroduction from './components/new-business-introduction';
import type { SharedState } from './create-business-onboarding.types';

type CreateBusinessOnboardingProps = {
  context: {
    requirement: CreateBusinessOnboardingRequirement;
    overallOutcome?: OverallOutcome;
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
  } = context;
  const sharedState = { authToken, kybFixtureResult, onDone, onError };

  if (requiresBusinessSelection) {
    return <BusinessSelectionContent state={sharedState} />;
  }
  return <StartOnboardingWithoutSelection state={sharedState} />;
};

const StartOnboardingWithoutSelection = ({ state }: { state: SharedState }) => {
  const { authToken, kybFixtureResult, onDone, onError } = state;
  const businessOnboardingMutation = useMutation({
    ...postHostedBusinessOnboardingMutation({ headers: { 'X-Fp-Authorization': authToken } }),
    onError,
  });

  useEffect(() => {
    businessOnboardingMutation.mutate(
      {
        body: {
          kybFixtureResult,
          useLegacyInheritLogic: false,
        },
      },
      { onSuccess: onDone },
    );
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
      data: { kybFixtureResult: state.kybFixtureResult },
    }),
  });
  if (businessesQuery.isPending) {
    return <Loading />;
  }
  if (businessesQuery.data && businessesQuery.data.length === 0) {
    return <NoBusinessesFlow state={state} />;
  }
  if (businessesQuery.data && businessesQuery.data.length > 0) {
    return <BusinessSelectionFlow state={state} businesses={businessesQuery.data} />;
  }
  return null;
};

const NoBusinessesFlow = ({ state: { authToken, kybFixtureResult, onDone, onError } }: { state: SharedState }) => {
  const mutation = useMutation({
    ...postHostedBusinessOnboardingMutation({ headers: { 'X-Fp-Authorization': authToken } }),
    onError,
  });

  useEffect(() => {
    mutation.mutate({ body: { kybFixtureResult, useLegacyInheritLogic: false } });
  }, []);

  return <NewBusinessIntroduction isBusy={mutation.isPending} onDone={onDone} />;
};

const BusinessSelectionFlow = ({
  businesses,
  state: { authToken, kybFixtureResult, onDone, onError },
}: { businesses: HostedBusiness[]; state: SharedState }) => {
  const businessOnboardingMutation = useMutation({
    ...postHostedBusinessOnboardingMutation({ headers: { 'X-Fp-Authorization': authToken } }),
    onError,
  });
  const [shouldShowIntroduction, setShowIntroduction] = useState(() => businesses.length === 0);

  const handleNewBusiness = () => {
    businessOnboardingMutation.mutate(
      { body: { kybFixtureResult, useLegacyInheritLogic: false } },
      {
        onSuccess: () => setShowIntroduction(true),
      },
    );
  };

  const handleSelectBusiness = (businessId: string) => {
    businessOnboardingMutation.mutate(
      { body: { kybFixtureResult, inheritBusinessId: businessId, useLegacyInheritLogic: false } },
      { onSuccess: onDone },
    );
  };

  return shouldShowIntroduction ? (
    <NewBusinessIntroduction onDone={onDone} />
  ) : (
    <BusinessSelector
      businesses={businesses}
      isBusy={businessOnboardingMutation.isPending}
      onAddNew={handleNewBusiness}
      onSelect={handleSelectBusiness}
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
