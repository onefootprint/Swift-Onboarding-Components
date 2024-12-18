import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpBidOnboardingsByOnboardingIdBusinessInsightsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from 'src/components/error';
import type { Subsection } from '../../../../hooks/use-subsections';
import BusinessDetails from './components/business-details';
import Loading from './components/loading';

export type DecryptedContentProps = {
  onboardingId: string;
  selectedSubsection: Subsection;
};

const DecryptedContent = ({ onboardingId, selectedSubsection }: DecryptedContentProps) => {
  const entityId = useEntityId();
  const {
    isPending,
    error,
    data: insights,
  } = useQuery({
    ...getEntitiesByFpBidOnboardingsByOnboardingIdBusinessInsightsOptions({
      path: { fpBid: entityId, onboardingId },
    }),
    enabled: Boolean(entityId) && Boolean(onboardingId),
  });

  return (
    <>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {(insights?.names || insights?.details) && selectedSubsection === 'business-details' && (
        <BusinessDetails names={insights.names} details={insights.details} />
      )}
    </>
  );
};

export default DecryptedContent;
