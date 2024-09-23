import { InvestorProfileDI, InvestorProfileRiskTolerance } from '@onefootprint/types';
import type React from 'react';

import { getLogger } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { RiskToleranceData } from '../../utils/state-machine/types';
import RiskToleranceForm from './components/risk-tolerance-form';

type RiskToleranceProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const DiRiskTolerance = InvestorProfileDI.riskTolerance;
const { logError } = getLogger({ location: 'investor-profile-risk-tolerance' });

const RiskTolerance = ({ onSuccess, renderFooter }: RiskToleranceProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (riskToleranceData: RiskToleranceData) => {
    syncData({
      authToken,
      data: riskToleranceData,
      speculative: true,
      onSuccess: () => {
        send({ type: 'riskToleranceSubmitted', payload: { ...riskToleranceData } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively syncing data on investor profile risk tolerance page: ${error}`,
          error,
        );
      },
    });
  };

  return (
    <RiskToleranceForm
      defaultValues={{ [DiRiskTolerance]: data?.[DiRiskTolerance] || InvestorProfileRiskTolerance.conservative }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isPending)
        ) : (
          <ContinueButton isLoading={mutation.isPending} trackActionName="investor-profile:risk-tolerance-continue" />
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default RiskTolerance;
