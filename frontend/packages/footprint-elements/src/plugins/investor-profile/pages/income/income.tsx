import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { IncomeData } from '../../utils/state-machine/types';
import IncomeForm from './components/income-form';

const Income = () => {
  const { t } = useTranslation('pages.income');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (incomeData: IncomeData) => {
    syncData({
      authToken,
      data: incomeData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'incomeSubmitted',
          payload: {
            ...incomeData,
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
      <IncomeForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.annualIncome]:
            data?.[InvestorProfileDataAttribute.annualIncome],
        }}
      />
    </>
  );
};

export default Income;
