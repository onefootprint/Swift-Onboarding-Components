import { getErrorMessage } from '@onefootprint/request';
import type { BusinessDIData, BusinessDataResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useBusinessData } from '../../../hooks';

type SyncDataArgs = {
  authToken?: string;
  data: BusinessDIData;
  speculative?: boolean;
  onSuccess?: (data: BusinessDataResponse) => void;
  onError?: (error: string) => void;
};

const useSyncData = () => {
  const businessDataMutation = useBusinessData();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.components.sync-data-error',
  });
  const toast = useToast();

  const syncData = ({ authToken, data, speculative, onSuccess, onError }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('empty-auth-token.title'),
        description: t('empty-auth-token.description'),
        variant: 'error',
      });
      onError?.('Found empty auth token while syncing kyb data fields.');
      return;
    }

    if (businessDataMutation.isLoading) {
      return;
    }

    businessDataMutation.mutate(
      {
        data,
        authToken,
        speculative,
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
            `KYB useSyncData encountered error while syncing data${
              speculative ? ' speculatively' : ''
            }: ${getErrorMessage(error)}`,
          );
        },
      },
    );
  };

  return { mutation: businessDataMutation, syncData };
};

export default useSyncData;
