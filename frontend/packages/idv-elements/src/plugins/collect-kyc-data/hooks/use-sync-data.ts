import { useTranslation } from '@onefootprint/hooks';
import { IdDI, IdDIData } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';

import useUserData from '../../../hooks/api/hosted/user/vault/use-user-data';
import { KycData } from '../utils/data-types';
import useCollectKycDataMachine from './use-collect-kyc-data-machine';

type SyncDataArgs = {
  data: KycData;
  speculative?: boolean;
  onSuccess?: () => void;
};

const useSyncData = () => {
  const [state] = useCollectKycDataMachine();
  const { authToken } = state.context;
  const userDataMutation = useUserData();

  const { t } = useTranslation('components.sync-data-error');
  const toast = useToast();

  const handleError = (error: unknown) => {
    toast.show({
      title: t('sync-data-error.title'),
      description: t('sync-data-error.description'),
      variant: 'error',
    });
    console.error(error);
  };

  const syncData = ({ data, speculative, onSuccess }: SyncDataArgs) => {
    if (!authToken) {
      console.error('Found empty auth token while syncing kyc data fields.');
      return;
    }

    const keyValuePairs: [IdDI, string][] = Object.entries(data).map(
      ([key, value]) => [key as IdDI, value.value],
    );
    const requestData: IdDIData = Object.fromEntries(keyValuePairs);
    // DOB is accepted by the backend in a different format
    const dobData = requestData[IdDI.dob];
    if (dobData) {
      const [month, day, year] = dobData.split('/');
      requestData[IdDI.dob] = `${year}-${month}-${day}`;
    }

    userDataMutation.mutate(
      {
        data: requestData,
        authToken,
        speculative,
      },
      {
        onSuccess,
        onError: handleError,
      },
    );
  };

  return { syncData, mutation: userDataMutation };
};

export default useSyncData;
