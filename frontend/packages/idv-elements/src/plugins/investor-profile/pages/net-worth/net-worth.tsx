import {
  InvestorProfileDI,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import React from 'react';

import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { NetWorthData } from '../../utils/state-machine/types';
import NetWorthForm from './components/net-worth-form';

const NetWorth = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

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
      onError: showToast,
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
