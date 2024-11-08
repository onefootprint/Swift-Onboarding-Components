import { Container } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import noop from 'lodash/noop';
import { useState } from 'react';
import useTrackingStorage from 'src/hooks/use-tracking-storage';
import Form, { type FormData } from './components/form';
import Header from './components/header';
import Takeover from './components/takeover';
import { useGetInProgressOnboardings } from './hooks/use-get-in-progress-onboardings';
import { useSubmitHubspotOnboardingForm } from './hooks/use-submit-hubspot-onboarding-form';

const Onboarding = () => {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const session = useSession();
  const trackingStorage = useTrackingStorage();
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const authToken = session.authHeaders['x-fp-dashboard-authorization'] || '';
  const { data: inProgressOnboardings } = useGetInProgressOnboardings({ authToken });
  const { mutateAsync: submitHubspotOnboardingForm, isPending: isSubmitting } = useSubmitHubspotOnboardingForm();
  const shouldShowTakeover = inProgressOnboardings && inProgressOnboardings.length > 0 && !hasShownWarning;

  const handleConfirm = () => {
    setHasShownWarning(true);
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  const submitOnboardingData = async (email: string, formData: FormData) => {
    try {
      await submitHubspotOnboardingForm({ ...trackingStorage.data, ...formData, email });
      trackGoogleConversion(trackingStorage.data);
    } catch (error) {
      console.error('Error submitting to HubSpot:', error);
    } finally {
      trackingStorage.reset();
    }
  };

  const handleCompleted = async (formData: FormData) => {
    const userEmail = session.data.user?.email;
    if (userEmail) {
      await submitOnboardingData(userEmail, formData);
    }
    session.completeOnboarding();
    router.push('/users');
  };

  // even if inProgressOnboardings is empty ([]) it will be truthy
  return session.data.user && !!inProgressOnboardings ? (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {shouldShowTakeover ? (
        <Takeover inProgressOnboardings={inProgressOnboardings} onConfirm={handleConfirm} />
      ) : (
        <>
          <Header userEmail={session.data.user.email} onLogout={handleLogout} />
          <Content>
            <Container>
              <Form onComplete={isSubmitting ? noop : handleCompleted} />
            </Container>
          </Content>
        </>
      )}
    </>
  ) : null;
};

const trackGoogleConversion = (utmProps: Record<string, string | undefined>) => {
  if (typeof window.gtag !== 'function') return;
  const GOOGLE_TAG_CONVERSION_ID_AND_LABEL = 'AW-16622916059/ATjFCP6visEZENujtvY9';

  window.gtag('event', 'conversion', {
    send_to: GOOGLE_TAG_CONVERSION_ID_AND_LABEL,
    ...(utmProps.utmSource && { utm_source: utmProps.utmSource }),
    ...(utmProps.utmMedium && { utm_medium: utmProps.utmMedium }),
    ...(utmProps.utmCampaign && { utm_campaign: utmProps.utmCampaign }),
    ...(utmProps.utmTerm && { utm_term: utmProps.utmTerm }),
    ...(utmProps.utmContent && { utm_content: utmProps.utmContent }),
  });
};

const Content = styled.div`
  --header-height: 60px;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
`;

export default Onboarding;
