import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileDataAttribute,
  InvestorProfileRiskTolerance,
} from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { RiskToleranceData } from '../../utils/state-machine/types';
import RiskToleranceForm from './components/risk-tolerance-form';

const RiskTolerance = () => {
  const { t } = useTranslation('pages.risk-tolerance');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (riskToleranceData: RiskToleranceData) => {
    syncData({
      authToken,
      data: riskToleranceData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'riskToleranceSubmitted',
          payload: {
            ...riskToleranceData,
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
      <RiskToleranceForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.riskTolerance]:
            data?.[InvestorProfileDataAttribute.riskTolerance] ||
            InvestorProfileRiskTolerance.conservative,
        }}
      />
    </>
  );
};

export default RiskTolerance;
