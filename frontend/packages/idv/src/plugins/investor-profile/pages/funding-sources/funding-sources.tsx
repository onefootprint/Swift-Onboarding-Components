import { InvestorProfileDI } from '@onefootprint/types';
import type React from 'react';

import { getLogger } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { FundingSourcesData } from '../../utils/state-machine/types';
import FundingSourcesForm from './components/funding-sources-form';

type FundingSourcesProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const fundingSources = InvestorProfileDI.fundingSources;
const { logError } = getLogger({
  location: 'investor-profile-funding-sources',
});

const FundingSources = ({ onSuccess, renderFooter }: FundingSourcesProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (data: FundingSourcesData) => {
    syncData({
      authToken,
      data,
      speculative: true,
      onSuccess: () => {
        send({ type: 'fundingSourcesSubmitted', payload: { ...data } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively syncing data on investor profile funding sources page: ${error}`,
          error,
        );
      },
    });
  };

  return (
    <FundingSourcesForm
      defaultValues={{ [fundingSources]: data?.[fundingSources] }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isLoading)
        ) : (
          <ContinueButton isLoading={mutation.isLoading} trackActionName="investor-profile:funding-sources-continue" />
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default FundingSources;
