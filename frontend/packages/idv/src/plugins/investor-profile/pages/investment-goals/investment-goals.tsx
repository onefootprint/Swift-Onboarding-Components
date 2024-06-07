import { InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import { Logger } from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { InvestmentGoalsData } from '../../utils/state-machine/types';
import InvestmentGoalsForm from './components/investment-goals-form';

const InvestmentGoals = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

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
      onError: (error: unknown) => {
        Logger.error(
          `Encountered error while speculatively syncing data on investor profile investment goals page: ${error}`,
          { location: 'investor-profile-investment-goals' },
        );
      },
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <InvestmentGoalsForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.investmentGoals]: data?.[InvestorProfileDI.investmentGoals],
        }}
      />
    </>
  );
};

export default InvestmentGoals;
