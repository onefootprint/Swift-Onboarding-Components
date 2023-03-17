import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { NetWorthData } from '../../utils/state-machine/types';
import NetWorthForm from './components/net-worth-form';

const NetWorth = () => {
  const { t } = useTranslation('pages.net-worth');
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
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <NetWorthForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.netWorth]:
            data?.[InvestorProfileDataAttribute.netWorth],
        }}
      />
    </>
  );
};

export default NetWorth;
