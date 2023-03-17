import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileDataAttribute,
  InvestorProfileEmployedByBrokerage,
} from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { EmployedByBrokerageData } from '../../utils/state-machine/types';
import BrokerageEmploymentForm from './components/brokerage-employment-form';

const BrokerageEmployment = () => {
  const { t } = useTranslation('pages.brokerage-employment');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (brokerageEmploymentData: EmployedByBrokerageData) => {
    syncData({
      authToken,
      data: brokerageEmploymentData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'brokerageEmploymentSubmitted',
          payload: {
            ...brokerageEmploymentData,
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
      <BrokerageEmploymentForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.employedByBrokerage]:
            data?.[InvestorProfileDataAttribute.employedByBrokerage] ||
            InvestorProfileEmployedByBrokerage.no,
          [InvestorProfileDataAttribute.employedByBrokerageFirm]:
            data?.[InvestorProfileDataAttribute.employedByBrokerageFirm],
        }}
      />
    </>
  );
};

export default BrokerageEmployment;
