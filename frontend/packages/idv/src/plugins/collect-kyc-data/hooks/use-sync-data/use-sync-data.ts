import { getErrorMessage } from '@onefootprint/request';
import type { UserDataError } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import type { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../components/l10n-provider';
import useUserData from '../../../../hooks/api/hosted/user/vault/use-user-data';
import useIdvRequestErrorToast from '../../../../hooks/ui/use-idv-request-error-toast';
import Logger from '../../../../utils/logger';
import type { KycData } from '../../utils/data-types';
import useCollectKycDataMachine from '../use-collect-kyc-data-machine';
import getRequestData from './utils/get-request-data';

export type SyncDataFieldErrors = UserDataError['error']['message'];

type SyncDataArgs = {
  data: KycData;
  speculative?: boolean;
  onSuccess?: () => void;
  onError?: (errors: SyncDataFieldErrors) => void;
};

const useSyncData = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.components.sync-data-error',
  });
  const [state] = useCollectKycDataMachine();
  const showRequestErrorToast = useIdvRequestErrorToast();
  const { authToken, requirement } = state.context;
  const l10n = useL10nContext();
  const locale = l10n?.locale || 'en-US';
  const userDataMutation = useUserData();
  const toast = useToast();

  const logError = (errorMessage: string) => {
    Logger.error(errorMessage, 'kyc-use-sync-data');
  };

  const syncData = ({
    data: rawData,
    speculative,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('empty-auth-token.title'),
        description: t('empty-auth-token.description'),
        variant: 'error',
      });
      logError('Found empty auth token while syncing kyc data fields.');
      return;
    }
    if (userDataMutation.isLoading) {
      return;
    }

    try {
      const data = getRequestData(locale, rawData, requirement, !speculative);
      userDataMutation.mutate(
        {
          data,
          authToken,
          speculative,
        },
        {
          onSuccess,
          onError: (err: unknown) => {
            const errors = (err as AxiosError<UserDataError>)?.response?.data
              .error.message;
            if (typeof errors === 'string') {
              showRequestErrorToast(err);
              logError(
                `Kyc useSyncData encountered error while syncing data${
                  speculative ? ' speculatively' : ''
                } ${getErrorMessage(err)}`,
              );
              return;
            }
            const validDis = new Set(Object.values(IdDI));
            const fieldErrors = Object.fromEntries(
              Object.entries(errors || {}).filter(([key]) =>
                validDis.has(key as IdDI),
              ),
            );
            if (Object.keys(fieldErrors).length > 0) {
              onError?.(fieldErrors);
            } else {
              toast.show({
                title: t('invalid-inputs.title'),
                description: t('invalid-inputs.description'),
                variant: 'error',
              });
              logError(
                `Kyc useSyncData encountered error while syncing data${
                  speculative ? ' speculatively' : ''
                } ${getErrorMessage(err)}`,
              );
            }
          },
        },
      );
    } catch (e) {
      toast.show({
        title: t('request-data.title'),
        description: t('request-data.description'),
        variant: 'error',
      });
      logError(
        `Unable to generate a valid request data obj because of incomplete/dangling DIs. ${e}`,
      );
    }
  };

  return { syncData, mutation: userDataMutation };
};

export default useSyncData;
