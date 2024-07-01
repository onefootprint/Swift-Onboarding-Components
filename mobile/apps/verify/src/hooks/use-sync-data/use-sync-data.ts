import {
  type CollectKycDataRequirement,
  type UserDataError,
  IdDI,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import type { AxiosError } from 'axios';

import type { KycData } from '@/types';

import useRequestErrorToast from '../use-request-error-toast';
import useTranslation from '../use-translation';
import useUserData from '../use-user-data';
import getRequestData from './utils/get-request-data';

export type SyncDataFieldErrors = UserDataError['error']['message'];

type SyncDataArgs = {
  data: KycData;
  speculative?: boolean;
  authToken: string;
  requirement: CollectKycDataRequirement;
  onSuccess?: () => void;
  onError?: (errors: SyncDataFieldErrors) => void;
};

const useSyncData = () => {
  const { t } = useTranslation('components.sync-data-error');
  const locale = 'en-US'; // TODO: get locale from l10n context
  const userDataMutation = useUserData();
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();

  const syncData = ({
    data: rawData,
    speculative,
    authToken,
    requirement,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('empty-auth-token.title'),
        description: t('empty-auth-token.description'),
        variant: 'error',
      });
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
          bootstrapDis: [],
        },
        {
          onSuccess,
          onError: (err: unknown) => {
            const errors = (err as AxiosError<UserDataError>)?.response?.data
              .error.message;
            if (typeof errors === 'string') {
              showRequestErrorToast(err);
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
    }
  };

  return { syncData, mutation: userDataMutation };
};

export default useSyncData;
