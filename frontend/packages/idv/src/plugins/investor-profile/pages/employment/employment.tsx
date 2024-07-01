import { InvestorProfileDI } from '@onefootprint/types';

import React from 'react';
import { getLogger } from '../../../../utils/logger';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { EmploymentData } from '../../utils/state-machine/types';
import EmploymentForm from './components/employment-form';

const { logError } = getLogger({ location: 'investor-profile-employment' });

const Employment = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (employmentData: EmploymentData) => {
    syncData({
      authToken,
      data: employmentData,
      speculative: true,
      onSuccess: () => {
        send({ type: 'employmentSubmitted', payload: { ...employmentData } });
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively syncing data on investor-profile employment page ${error}`,
          error,
        );
      },
    });
  };

  return (
    <EmploymentForm
      isLoading={mutation.isLoading}
      onSubmit={handleSubmit}
      defaultValues={{
        [InvestorProfileDI.employmentStatus]: data?.[InvestorProfileDI.employmentStatus],
        [InvestorProfileDI.occupation]: data?.[InvestorProfileDI.occupation],
        [InvestorProfileDI.employer]: data?.[InvestorProfileDI.employer],
      }}
    />
  );
};

export default Employment;
