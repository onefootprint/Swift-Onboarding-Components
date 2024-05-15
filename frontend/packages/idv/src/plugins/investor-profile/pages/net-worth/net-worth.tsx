import {
  InvestorProfileDI,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import React from 'react';

import Logger from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { NetWorthData } from '../../utils/state-machine/types';
import NetWorthForm from './components/net-worth-form';

const NetWorth = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (networthData: NetWorthData) => {
    syncData({
      authToken,
      data: networthData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'netWorthSubmitted',
          payload: {
            ...networthData,
          },
        });
      },
      onError: (error: unknown) => {
        Logger.error(
          `Encountered error while speculatively syncing data on investor profile net worth page: ${error}`,
          { location: 'investor-profile-net-worth' },
        );
      },
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <NetWorthForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.netWorth]:
            data?.[InvestorProfileDI.netWorth] || InvestorProfileNetWorth.le50k,
        }}
      />
    </>
  );
};

export default NetWorth;
