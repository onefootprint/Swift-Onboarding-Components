import {
  InvestorProfileAnnualIncome,
  InvestorProfileDI,
} from '@onefootprint/types';
import React from 'react';

import { Logger } from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { IncomeData } from '../../utils/state-machine/types';
import IncomeForm from './components/income-form';

const Income = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (incomeData: IncomeData) => {
    syncData({
      authToken,
      data: incomeData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'incomeSubmitted',
          payload: {
            ...incomeData,
          },
        });
      },
      onError: (error: string) => {
        Logger.error(
          `Encountered error while speculatively syncing data on investor profile income page: ${error}`,
          { location: 'investor-profile-income' },
        );
      },
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <IncomeForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.annualIncome]:
            data?.[InvestorProfileDI.annualIncome] ||
            InvestorProfileAnnualIncome.le25k,
        }}
      />
    </>
  );
};

export default Income;
