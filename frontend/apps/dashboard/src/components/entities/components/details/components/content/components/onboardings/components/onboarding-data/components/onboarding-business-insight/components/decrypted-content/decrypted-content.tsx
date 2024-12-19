import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import ErrorComponent from 'src/components/error';
import type { Subsection } from '../../../../hooks/use-subsections';
import BusinessDetails from './components/business-details';
import Loading from './components/loading';
import People from './components/people';
import useOnboardingBusinessInsights from './hooks/use-onboarding-business-insights';

export type DecryptedContentProps = {
  onboardingId: string;
  selectedSubsection: Subsection;
};

const DecryptedContent = ({ onboardingId, selectedSubsection }: DecryptedContentProps) => {
  const entityId = useEntityId();
  const { isPending, error, data: insights } = useOnboardingBusinessInsights(entityId, onboardingId);

  return (
    <>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {(insights?.names || insights?.details) && selectedSubsection === 'business-details' && (
        <BusinessDetails names={insights.names} details={insights.details} registrations={insights.registrations} />
      )}
      {insights?.people && selectedSubsection === 'people' && <People data={insights.people} />}
    </>
  );
};

export default DecryptedContent;
