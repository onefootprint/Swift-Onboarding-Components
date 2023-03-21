import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileDataAttribute } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { DeclarationData } from '../../utils/state-machine/types';
import DeclarationsForm from './components/declarations-form';

const Declarations = () => {
  const { t } = useTranslation('pages.declarations');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const showToast = useSyncErrorToast();

  const handleSubmit = (declarationData: DeclarationData) => {
    // First send the declarations data speculatively to check for any errors
    syncData({
      authToken,
      data: declarationData,
      speculative: true,
      onSuccess: () => {
        // Since this is the last data collection step, go ahead and submit all of this data to backend non-speculatively
        syncData({
          authToken,
          data: {
            ...data,
            ...declarationData,
          },
          onSuccess: () => {
            send({
              type: 'declarationsSubmitted',
              payload: {
                ...declarationData,
              },
            });
          },
          onError: showToast,
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
      <DeclarationsForm
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

export default Declarations;
