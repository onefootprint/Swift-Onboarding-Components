import { getErrorMessage } from '@onefootprint/request';
import type { InvestorProfileData, UserDataResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useUserData } from '../../../queries';
import { omitEqualData } from '../utils/utils';
import useInvestorProfileMachine from './use-investor-profile-machine';

type SyncDataArgs = {
  authToken?: string;
  data: InvestorProfileData;
  onSuccess?: (data: UserDataResponse) => void;
  onError?: (error: string) => void;
};

const useSyncData = () => {
  const investorProfileDataMutation = useUserData();
  const [state] = useInvestorProfileMachine();
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.components' });
  const toast = useToast();

  const syncData = ({ authToken, data, onSuccess, onError }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('sync-data-error.empty-auth-token.title'),
        description: t('sync-data-error.empty-auth-token.description'),
        variant: 'error',
      });
      onError?.('Found empty auth token while syncing investor profile data fields.');
      return;
    }

    if (investorProfileDataMutation.isPending) {
      return;
    }

    const filteredData = omitEqualData(state.context.vaultData, data);
    if (Object.keys(filteredData).length === 0) {
      onSuccess?.({ data: filteredData });
      return;
    }

    investorProfileDataMutation.mutate(
      {
        data: filteredData,
        // TODO we should populate this
        bootstrapDis: [],
        authToken,
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
          onError?.(`Investor profile useSyncData encountered error while syncing data: ${getErrorMessage(error)}`);
        },
      },
    );
  };

  return { mutation: investorProfileDataMutation, syncData };
};

export default useSyncData;
