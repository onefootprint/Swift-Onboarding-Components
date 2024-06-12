import type { CollectKycDataRequirement, InvestorProfileDI, VaultValue } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import type { AxiosError } from 'axios';
import omit from 'lodash/omit';
import { useTranslation } from 'react-i18next';

import { useRequestError } from '@onefootprint/request';
import { useL10nContext } from '../../../../components/l10n-provider';
import useUserData from '../../../../hooks/api/hosted/user/vault/use-user-data';
import useIdvRequestErrorToast from '../../../../hooks/ui/use-idv-request-error-toast';
import { getLogger } from '../../../../utils/logger';
import type { KycData } from '../../utils/data-types';
import useCollectKycDataMachine from '../use-collect-kyc-data-machine';
import getRequestData from './utils/get-request-data';

export type SyncDataFieldErrors = Partial<Record<IdDI, string>> | string;
type ObjWithValue = Record<string, { value?: unknown }>;
type SyncDataArgs = {
  data: KycData;
  onSuccess?: (data: KycData) => void;
  onError?: (errors: SyncDataFieldErrors) => void;
};

const onlyNumericAndPlus = (s?: unknown): string => (typeof s === 'string' ? s.trim().replace(/[^0-9+]/g, '') : '');

const { logError } = getLogger({ location: 'kyc-use-sync-data' });

const useSyncData = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.components.sync-data-error',
  });
  const [state] = useCollectKycDataMachine();
  const showRequestErrorToast = useIdvRequestErrorToast();
  const { getErrorContext, getErrorCode } = useRequestError();
  const { authToken, requirement } = state.context;
  const l10n = useL10nContext();
  const locale = l10n?.locale || 'en-US';
  const userDataMutation = useUserData();
  const toast = useToast();

  const syncData = async ({ data: rawData, onSuccess, onError }: SyncDataArgs): Promise<void> => {
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

    let data: Partial<Record<IdDI | InvestorProfileDI, VaultValue>> | undefined;
    let bootstrapDis: IdDI[] | undefined;
    try {
      ({ data, bootstrapDis } = getRequestData(locale, rawData, requirement));
    } catch (e) {
      toast.show({
        title: t('request-data.title'),
        description: t('request-data.description'),
        variant: 'error',
      });
      logError(`Unable to generate a valid request data obj because of incomplete/dangling DIs. ${e}`);
      return;
    }

    const handleError = (err: unknown) => {
      const isVaultDataValidationError = getErrorCode(err) === 'T120';
      if (!isVaultDataValidationError) {
        showRequestErrorToast(err);
        logError('Kyc useSyncData encountered error while syncing data', err);
        return;
      }
      const validDis = new Set(Object.values(IdDI));
      const context = getErrorContext(err);
      const fieldErrors = Object.fromEntries(Object.entries(context).filter(([key]) => validDis.has(key as IdDI)));
      if (Object.keys(fieldErrors).length > 0) {
        onError?.(fieldErrors);
      } else {
        toast.show({
          title: t('invalid-inputs.title'),
          description: t('invalid-inputs.description'),
          variant: 'error',
        });
        logError('Kyc useSyncData encountered invalid inputs error while syncing data', err);
      }
    };

    const handleSuccess = () => {
      // call onSuccess after cleaning the dirty flag now that the data has been saved
      const cleanedData = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => {
          const valueCopy = { ...value };
          valueCopy.dirty = false;
          valueCopy.bootstrap = false;
          valueCopy.decrypted = false;
          valueCopy.scrubbed = false;
          valueCopy.disabled = value.disabled ?? false;

          return [key, valueCopy];
        }),
      );

      onSuccess?.(cleanedData);
    };

    try {
      await userDataMutation.mutateAsync({ data, bootstrapDis, authToken });
      handleSuccess();
    } catch (e) {
      handleError(e);
    }
  };

  return { syncData, mutation: userDataMutation };
};

export const omitPhoneAndEmail = <T extends ObjWithValue>(data: T) => omit(data, [IdDI.phoneNumber, IdDI.email]);

export const checkPhoneEmailBeforeSubmit = <T extends ObjWithValue>(
  initial: T,
  current: T,
  requirement: CollectKycDataRequirement,
  verifiedMethods?: { phone?: string | false; email?: string | false },
) => {
  const propsToRemove = [];

  const hasVerified = {
    email: Boolean(verifiedMethods?.email),
    phone: Boolean(verifiedMethods?.phone),
  };
  const valueHasNotChanged = {
    email: String(initial[IdDI.email]?.value).trim() === String(current[IdDI.email]?.value).trim(),
    phone:
      onlyNumericAndPlus(initial[IdDI.phoneNumber]?.value) === onlyNumericAndPlus(current[IdDI.phoneNumber]?.value),
  };

  // If a piece of data hasn't changed or the backend already has it verified, remove it from the
  // data we'll send to the backend as long as the backend isn't explicitly requesting it.
  if (
    (hasVerified.email || valueHasNotChanged.email) &&
    !requirement.missingAttributes.includes(CollectedKycDataOption.email)
  ) {
    propsToRemove.push(IdDI.email);
  }

  if (
    (hasVerified.phone || valueHasNotChanged.phone) &&
    !requirement.missingAttributes.includes(CollectedKycDataOption.phoneNumber)
  ) {
    propsToRemove.push(IdDI.phoneNumber);
  }

  return omit(current, propsToRemove);
};

export default useSyncData;
