import { InvestorProfileDI, InvestorProfileNetWorth } from '@onefootprint/types';
import type React from 'react';

import { getLogger, trackAction } from '@/idv/utils';
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

  const handleSubmit = (data: NetWorthData) => {
    trackAction('investor-profile:net-worth-submit');
    syncData({
      authToken,
      data,
      onSuccess: () => {
        send({ type: 'netWorthSubmitted', payload: { ...data } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError('Encountered error while speculatively syncing data on investor profile net worth page', error);
      },
    });
  };

  return (
    <NetWorthForm
      defaultValues={{ [netWorth]: data?.[netWorth] || InvestorProfileNetWorth.le50k }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isPending)
        ) : (
          <ContinueButton isLoading={mutation.isPending} trackActionName="investor-profile:net-worth-continue" />
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default NetWorth;
