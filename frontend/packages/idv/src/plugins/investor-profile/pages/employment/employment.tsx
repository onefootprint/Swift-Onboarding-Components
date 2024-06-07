import { IcoDollar40, IcoUser40 } from '@onefootprint/icons';
import { InvestorProfileDI } from '@onefootprint/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import GenericTransition from '../../../../components/animations/generic-transition';
import { Logger } from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { EmploymentData } from '../../utils/state-machine/types';
import EmploymentForm from './components/employment-form';

const Employment = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, showTransition, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('idv');
  // Only show the animation if this is the first time we are rendering this page
  // If user saved data, and navigated prev to this page, don't animate again
  const hasCollectedData = Object.keys(data).length > 0;
  const [showAnimation, setShowAnimation] = useState(showTransition && !hasCollectedData);

  const handleSubmit = (employmentData: EmploymentData) => {
    syncData({
      authToken,
      data: employmentData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'employmentSubmitted',
          payload: {
            ...employmentData,
          },
        });
      },
      onError: (error: unknown) => {
        Logger.error(
          `Encountered error while speculatively syncing data on investor-profile employment page ${error}`,
          { location: 'investor-profile-employment' },
        );
      },
    });
  };

  return showAnimation ? (
    <AnimationContainer>
      <GenericTransition
        firstIcon={IcoUser40}
        secondIcon={IcoDollar40}
        firstText={t('investor-profile.components.transition-animation.source')}
        secondText={t('investor-profile.components.transition-animation.destination')}
        timeout={4000}
        onAnimationEnd={() => setShowAnimation(false)}
      />
    </AnimationContainer>
  ) : (
    <>
      <InvestorProfileNavigationHeader />
      <EmploymentForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.employmentStatus]: data?.[InvestorProfileDI.employmentStatus],
          [InvestorProfileDI.occupation]: data?.[InvestorProfileDI.occupation],
          [InvestorProfileDI.employer]: data?.[InvestorProfileDI.employer],
        }}
      />
    </>
  );
};

const AnimationContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export default Employment;
