import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { EmploymentData } from '../../utils/state-machine/types';
import EmploymentForm from './components/employment-form';

const Employment = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.employment');
  const showToast = useSyncErrorToast();

  const handleSubmit = (employmentData: EmploymentData) => {
    syncData({
      authToken,
      data: employmentData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'employmentSubmitted',
          payload: {
            ...employmentData,
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
      <EmploymentForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.occupation]:
            data?.[InvestorProfileDataAttribute.occupation],
        }}
      />
    </>
  );
};

export default Employment;
