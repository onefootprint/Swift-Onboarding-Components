import {
  InvestorProfileDI,
  InvestorProfileRiskTolerance,
} from '@onefootprint/types';
import React from 'react';

import { Logger } from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { RiskToleranceData } from '../../utils/state-machine/types';
import RiskToleranceForm from './components/risk-tolerance-form';

const RiskTolerance = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (riskToleranceData: RiskToleranceData) => {
    syncData({
      authToken,
      data: riskToleranceData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'riskToleranceSubmitted',
          payload: {
            ...riskToleranceData,
          },
        });
      },
      onError: (error: unknown) => {
        Logger.error(
          `Encountered error while speculatively syncing data on investor profile risk tolerance page: ${error}`,
          { location: 'investor-profile-risk-tolerance' },
        );
      },
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <RiskToleranceForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.riskTolerance]:
            data?.[InvestorProfileDI.riskTolerance] ||
            InvestorProfileRiskTolerance.conservative,
        }}
      />
    </>
  );
};

export default RiskTolerance;
