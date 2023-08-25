import { useTranslation } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
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
      title: t('title'),
      description: t('description'),
      variant: 'error',
    });
    console.error(error);
  };

  const syncData = ({ data, speculative, onSuccess }: SyncDataArgs) => {
    if (!authToken) {
      console.error('Found empty auth token while syncing kyc data fields.');
      return;
    }

    const requestData: Partial<Record<IdDI, string | string[]>> = {};
    Object.keys(data).forEach((di: string) => {
      const entry = data[di as keyof KycData];
      // Don't sync data that's already set in the vault
      if (entry && !entry?.scrubbed && !entry?.decrypted) {
        requestData[di as IdDI] = entry.value;
      }
    });

    // DOB is accepted by the backend in a different format
    const dobData = requestData[IdDI.dob] as string;
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
