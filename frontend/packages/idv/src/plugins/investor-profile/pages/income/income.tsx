import { InvestorProfileAnnualIncome, InvestorProfileDI } from '@onefootprint/types';
import type React from 'react';

import { getLogger, trackAction } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { IncomeData } from '../../utils/state-machine/types';
import IncomeForm from './components/income-form';

type IncomeProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const annualIncome = InvestorProfileDI.annualIncome;
const { logError } = getLogger({ location: 'investor-profile-income' });

const Income = ({ onSuccess, renderFooter }: IncomeProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (data: IncomeData) => {
    trackAction('investor-profile:income-submit');
    syncData({
      authToken,
      data,
      onSuccess: () => {
        send({ type: 'incomeSubmitted', payload: { ...data } });
        onSuccess?.();
      },
      onError: error => {
        logError(`Encountered error while speculatively syncing data on investor profile income page: ${error}`, error);
      },
    });
  };

  return (
    <IncomeForm
      defaultValues={{ [annualIncome]: data?.[annualIncome] || InvestorProfileAnnualIncome.le25k }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isPending)
        ) : (
          <ContinueButton isLoading={mutation.isPending} trackActionName="investor-profile:income-continue" />
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default Income;
