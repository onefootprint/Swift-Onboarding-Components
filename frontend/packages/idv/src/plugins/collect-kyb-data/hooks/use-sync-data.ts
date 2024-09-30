import { getErrorMessage } from '@onefootprint/request';
import type { BusinessDIData, BusinessDataResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../components/l10n-provider';
import { useBusinessData } from '../../../queries';
import { BO_FIELDS } from '../utils/attributes/attributes';
import { formatPayload, omitEqualData } from '../utils/utils';
import useCollectKybDataMachine from './use-collect-kyb-data-machine';

type SyncDataArgs = {
  authToken?: string;
  data: BusinessDIData;
  onSuccess?: (data: BusinessDataResponse) => void;
  onError?: (error: string) => void;
  speculative?: boolean;
};

const useSyncData = () => {
  const businessDataMutation = useBusinessData();
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.components.sync-data-error' });
  const [state] = useCollectKybDataMachine();
  const toast = useToast();
  const locale = useL10nContext()?.locale || 'en-US';
  const { kybRequirement, vaultBusinessData } = state.context;

  const syncData = ({ authToken, data, onSuccess, onError, speculative }: SyncDataArgs) => {
    if (!authToken) {
      toast.show({
        title: t('empty-auth-token.title'),
        description: t('empty-auth-token.description'),
        variant: 'error',
      });
      onError?.('Found empty auth token while syncing kyb data fields.');
      return;
    }

    if (businessDataMutation.isPending) {
      return;
    }

    const filteredData = omitEqualData(vaultBusinessData, data);
    const payload = formatPayload(locale, filteredData);

    if (kybRequirement.hasLinkedBos) {
      // If BOs are linked via API already, we don't support working with them in IDV.
      BO_FIELDS.forEach(di => {
        if (payload[di]) {
          console.warn(`About to vault ${di} when already linked`);
        }
        payload[di] = undefined;
      });
    }

    if (Object.keys(payload).length === 0) {
      onSuccess?.({ data: filteredData });
      return;
    }

    businessDataMutation.mutate(
      {
        authToken,
        data: payload,
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
            `KYB useSyncData encountered error while syncing data ${speculative ? ' speculatively' : ''}: ${getErrorMessage(error)}`,
          );
        },
      },
    );
  };

  return { mutation: businessDataMutation, syncData };
};

export default useSyncData;
