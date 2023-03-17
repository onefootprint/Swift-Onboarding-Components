import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { InvestmentGoalsData } from '../../utils/state-machine/types';
import InvestmentGoalsForm from './components/investment-goals-form';

const InvestmentGoals = () => {
  const { t } = useTranslation('pages.investment-goals');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (investmentGoalsData: InvestmentGoalsData) => {
    syncData({
      authToken,
      data: investmentGoalsData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'investmentGoalsSubmitted',
          payload: {
            ...investmentGoalsData,
          },
        });
      },
      onError: showToast,
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <InvestmentGoalsForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.investmentGoals]:
            data?.[InvestorProfileDataAttribute.investmentGoals],
        }}
      />
    </>
  );
};

export default InvestmentGoals;
