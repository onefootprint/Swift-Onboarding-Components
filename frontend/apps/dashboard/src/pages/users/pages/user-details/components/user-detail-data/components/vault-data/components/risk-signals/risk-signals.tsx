import React from 'react';
import useUser, { UserRiskSignals } from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import RiskSignalsSummary from './components/risk-signals-summary';

export type RiskSignalsProps = {
  type: keyof UserRiskSignals;
};

const RiskSignals = ({ type }: RiskSignalsProps) => {
  const userId = useUserId();
  const {
    user: { riskSignals },
    loadingStates,
    errors,
  } = useUser(userId);

  return (
    <RiskSignalsSummary
      data={riskSignals?.[type]}
      isLoading={loadingStates.riskSignals}
      error={errors.riskSignals}
    />
  );
};

export default RiskSignals;
