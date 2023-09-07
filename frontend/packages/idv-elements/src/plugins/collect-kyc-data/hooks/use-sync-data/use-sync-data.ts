import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';

import useUserData from '../../../../hooks/api/hosted/user/vault/use-user-data';
import { KycData } from '../../utils/data-types';
import useCollectKycDataMachine from '../use-collect-kyc-data-machine';
import getRequestData from './utils/get-request-data';

type SyncDataArgs = {
  data: KycData;
  speculative?: boolean;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
};

const useSyncData = () => {
  const { t } = useTranslation('components.sync-data-error');
  const [state] = useCollectKycDataMachine();
  const { authToken, requirement } = state.context;
  const userDataMutation = useUserData();
  const toast = useToast();

  const syncData = ({
    data: rawData,
    speculative,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      console.error('Found empty auth token while syncing kyc data fields.');
      toast.show({
        title: t('empty-auth-token.title'),
        description: t('empty-auth-token.description'),
        variant: 'error',
      });
      return;
    }

    try {
      const data = getRequestData(rawData, requirement, !speculative);
      userDataMutation.mutate(
        {
          data,
          authToken,
          speculative,
        },
        {
          onSuccess,
          onError: err => {
            console.error(
              `Kyc useSyncData encountered error while syncing data${
                speculative ? ' speculatively' : ''
              }`,
              getErrorMessage(err),
            );
            toast.show({
              title: t('invalid-inputs.title'),
              description: t('invalid-inputs.description'),
              variant: 'error',
            });
            onError?.(err);
          },
        },
      );
    } catch (e) {
      console.error(
        'Unable to generate a valid request data obj because of incomplete/dangling DIs.',
        e,
      );
      toast.show({
        title: t('request-data.title'),
        description: t('request-data.description'),
        variant: 'error',
      });
      onError?.();
    }
  };

  return { syncData, mutation: userDataMutation };
};

export default useSyncData;
