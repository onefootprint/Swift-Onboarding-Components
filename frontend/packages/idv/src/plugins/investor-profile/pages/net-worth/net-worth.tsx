import { InvestorProfileDI, InvestorProfileNetWorth } from '@onefootprint/types';
import React from 'react';

import { getLogger } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { NetWorthData } from '../../utils/state-machine/types';
import NetWorthForm from './components/net-worth-form';

type NetWorthProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const netWorth = InvestorProfileDI.netWorth;
const { logError } = getLogger({ location: 'investor-profile-net-worth' });

const NetWorth = ({ onSuccess, renderFooter }: NetWorthProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (networthData: NetWorthData) => {
    syncData({
      authToken,
      data: networthData,
      speculative: true,
      onSuccess: () => {
        send({ type: 'netWorthSubmitted', payload: { ...networthData } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively syncing data on investor profile net worth page: ${error}`,
          error,
        );
      },
    });
  };

  return (
    <NetWorthForm
      defaultValues={{ [netWorth]: data?.[netWorth] || InvestorProfileNetWorth.le50k }}
      footer={renderFooter ? renderFooter(mutation.isLoading) : <ContinueButton isLoading={mutation.isLoading} />}
      onSubmit={handleSubmit}
    />
  );
};

export default NetWorth;
