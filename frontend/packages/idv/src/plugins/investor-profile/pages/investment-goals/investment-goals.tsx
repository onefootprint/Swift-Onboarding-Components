import { InvestorProfileDI } from '@onefootprint/types';
import type React from 'react';

import { getLogger } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { InvestmentGoalsData } from '../../utils/state-machine/types';
import InvestmentGoalsForm from './components/investment-goals-form';

type InvestmentGoalsProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const investmentGoals = InvestorProfileDI.investmentGoals;
const { logError } = getLogger({ location: 'investor-profile-investment-goals' });

const InvestmentGoals = ({ onSuccess, renderFooter }: InvestmentGoalsProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (investmentGoalsData: InvestmentGoalsData) => {
    syncData({
      authToken,
      data: investmentGoalsData,
      speculative: true,
      onSuccess: () => {
        send({ type: 'investmentGoalsSubmitted', payload: { ...investmentGoalsData } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively syncing data on investor profile investment goals page: ${error}`,
          error,
        );
      },
    });
  };

  return (
    <InvestmentGoalsForm
      defaultValues={{ [investmentGoals]: data?.[investmentGoals] }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isLoading)
        ) : (
          <ContinueButton isLoading={mutation.isLoading} trackActionName="investor-profile:investment-goals-continue" />
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default InvestmentGoals;
