import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { DeclarationData } from '../../utils/state-machine/types';
import ConflictOfInterestForm from './components/conflict-of-interest-form';

const ConflictOfInterest = () => {
  const { t } = useTranslation('pages.conflict-of-interest-form');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (declarationData: DeclarationData) => {
    syncData({
      authToken,
      data: declarationData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'conflictOfInterestSubmitted',
          payload: {
            ...declarationData,
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
      <ConflictOfInterestForm
        isLoading={mutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDataAttribute.declarations]:
            data?.[InvestorProfileDataAttribute.declarations],
        }}
      />
    </>
  );
};

export default ConflictOfInterest;
