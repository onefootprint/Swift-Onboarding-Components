import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar40, IcoUser40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { InvestorProfileDI } from '@onefootprint/types';
import React, { useState } from 'react';

import GenericTransition from '../../../../components/animations/generic-transition';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { EmploymentData } from '../../utils/state-machine/types';
import EmploymentForm from './components/employment-form';

const Employment = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, showTransition, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { allT } = useTranslation('pages.employment');
  const showToast = useSyncErrorToast();
  // Only show the animation if this is the first time we are rendering this page
  // If user saved data, and navigated prev to this page, don't animate again
  const hasCollectedData = Object.keys(data).length > 0;
  const [showAnimation, setShowAnimation] = useState(
    showTransition && !hasCollectedData,
  );

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
        console.error(
          'Encountered error while speculatively syncing data on investor-profile employment page',
          getErrorMessage(error),
        );
        showToast();
      },
    });
  };

  return showAnimation ? (
    <AnimationContainer>
      <GenericTransition
        firstIcon={IcoUser40}
        secondIcon={IcoDollar40}
        firstText={allT('components.transition-animation.source')}
        secondText={allT('components.transition-animation.destination')}
        timeout={4000}
        onAnimationEnd={() => setShowAnimation(false)}
        showFeedbackIcon
      />
    </AnimationContainer>
  ) : (
    <>
      <InvestorProfileNavigationHeader />
      <EmploymentForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.employmentStatus]:
            data?.[InvestorProfileDI.employmentStatus],
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
