import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar40, IcoUser40 } from '@onefootprint/icons';
import { InvestorProfileDI } from '@onefootprint/types';
import React, { useState } from 'react';
import styled from 'styled-components';

import { GenericTransition, HeaderTitle } from '../../../../components';
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
  const { t, allT } = useTranslation('pages.employment');
  const showToast = useSyncErrorToast();
  const [showForm, setShowForm] = useState(!showTransition);

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
      onError: showToast,
    });
  };

  return showForm ? (
    <>
      <InvestorProfileNavigationHeader />
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <EmploymentForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.occupation]: data?.[InvestorProfileDI.occupation],
        }}
      />
    </>
  ) : (
    <AnimationContainer>
      <GenericTransition
        firstIcon={IcoUser40}
        secondIcon={IcoDollar40}
        firstText={allT('components.transition-animation.source')}
        secondText={allT('components.transition-animation.destination')}
        timeout={5500}
        onAnimationEnd={() => setShowForm(true)}
      />
    </AnimationContainer>
  );
};

const AnimationContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export default Employment;
