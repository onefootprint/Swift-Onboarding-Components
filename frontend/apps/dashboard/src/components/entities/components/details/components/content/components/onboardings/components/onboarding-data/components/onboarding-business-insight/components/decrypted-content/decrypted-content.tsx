import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { useMemo, useState } from 'react';
import ErrorComponent from 'src/components/error';
import type { Subsection } from '../../../../hooks/use-subsections';
import BusinessDetails from './components/business-details';
import Loading from './components/loading';
import Offices from './components/offices';
import People from './components/people';
import RegistrationDetails from './components/registration-details';
import Registrations from './components/registrations';
import Watchlist from './components/watchlist';
import useOnboardingBusinessInsights from './hooks/use-onboarding-business-insights';

export type DecryptedContentProps = {
  onboardingId: string;
  selectedSubsection: Subsection;
};

const DecryptedContent = ({ onboardingId, selectedSubsection }: DecryptedContentProps) => {
  const [openRegistrationId, setOpenRegistrationId] = useState<string | undefined>(undefined);
  const entityId = useEntityId();
  const { isPending, error, data: insights } = useOnboardingBusinessInsights(entityId, onboardingId);
  const openRegistration = useMemo(
    () => insights?.registrations.find(r => r.id === openRegistrationId),
    [insights?.registrations, openRegistrationId],
  );

  const handleOpen = (registrationId: string) => {
    setOpenRegistrationId(registrationId);
  };

  const handleClose = () => {
    setOpenRegistrationId(undefined);
  };

  return (
    <>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {(insights?.names || insights?.details) && selectedSubsection === 'business-details' && (
        <BusinessDetails names={insights.names} details={insights.details} onClick={handleOpen} />
      )}
      {insights?.people && selectedSubsection === 'people' && <People data={insights.people} />}
      {insights?.registrations && selectedSubsection === 'registrations' && (
        <Registrations data={insights.registrations} onClick={handleOpen} />
      )}
      {insights?.watchlist && selectedSubsection === 'watchlist' && <Watchlist data={insights.watchlist} />}
      {insights?.addresses && selectedSubsection === 'offices' && <Offices data={insights.addresses} />}
      {!!openRegistration && <RegistrationDetails registration={openRegistration} onClose={handleClose} />}
    </>
  );
};

export default DecryptedContent;
