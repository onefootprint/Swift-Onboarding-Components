import { getErrorMessage } from '@onefootprint/request';
import type { InvestorProfileData, UserDataResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useUserData } from '../../../hooks';

type SyncDataArgs = {
  authToken?: string;
  data: InvestorProfileData;
  speculative?: boolean;
  onSuccess?: (data: UserDataResponse) => void;
  onError?: (error: string) => void;
};

const useSyncData = () => {
  const investorProfileDataMutation = useUserData();
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.components',
  });
  const toast = useToast();

  const syncData = ({ authToken, data, speculative, onSuccess, onError }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('sync-data-error.empty-auth-token.title'),
        description: t('sync-data-error.empty-auth-token.description'),
        variant: 'error',
      });
      onError?.('Found empty auth token while syncing investor profile data fields.');
      return;
    }

    if (investorProfileDataMutation.isLoading) {
      return;
    }

    investorProfileDataMutation.mutate(
      {
        data,
        // TODO we should populate this
        bootstrapDis: [],
        authToken,
        speculative,
        allowExtraFields: true,
      },
      {
        onSuccess,
        onError: (error: unknown) => {
          toast.show({
            title: t('invalid-inputs.title'),
            description: t('invalid-inputs.description'),
            variant: 'error',
          });
          onError?.(
            `Investor profile useSyncData encountered error while syncing data${
              speculative ? ' speculatively' : ''
            }: ${getErrorMessage(error)}`,
          );
        },
      },
    );
  };

  return { mutation: investorProfileDataMutation, syncData };
};

export default useSyncData;
