import type { TenantVendorControl } from '@onefootprint/types/src/api/get-tenants';

import type { UpdateTenantVendorControl } from '../../../hooks/use-update-tenant';
import { ifChanged, strOrNull } from '../../../utils/form-data-utils';

export type TenantVendorControlFormData = {
  idologyEnabled: boolean;
  experianEnabled: boolean;
  lexisEnabled: boolean;
  experianSubscriberCode: string;
  middeskApiKey: string;
  neuroEnabled: boolean;
  sentilinkCredentials: {
    account: string;
    token: string;
  };
};

const newMiddeskApiKey = (newKey: string, exists: boolean) => {
  if (newKey) {
    // No-op if the new key is just the encrypted representation
    const newKeyIsEncrypted = Array.from(newKey.trim()).every(c => c === '•');
    return !newKeyIsEncrypted ? newKey : undefined;
  }
  if (!newKey && exists) {
    // Clear out the value
    return null;
  }
  return undefined;
};

const newSentilinkCredentials = (newCredentials: { account: string; token: string }, exists: boolean) => {
  if (newCredentials.account || newCredentials.token) {
    // No-op if both new credentials are just the encrypted representation
    const newAccountIsEncrypted = Array.from(newCredentials.account.trim()).every(c => c === '•');
    const newTokenIsEncrypted = Array.from(newCredentials.token.trim()).every(c => c === '•');
    if (!newAccountIsEncrypted || !newTokenIsEncrypted) {
      return {
        account: newAccountIsEncrypted ? undefined : newCredentials.account,
        token: newTokenIsEncrypted ? undefined : newCredentials.token,
      };
    }
  }
  if (exists) {
    if (!newCredentials.account || !newCredentials.token) {
      return null;
    }
  }
  return undefined;
};

export const convertFormData = (
  tvc: TenantVendorControl | undefined,
  formData: TenantVendorControlFormData,
): UpdateTenantVendorControl => ({
  idologyEnabled: ifChanged(formData.idologyEnabled, tvc?.idologyEnabled),
  experianEnabled: ifChanged(formData.experianEnabled, tvc?.experianEnabled),
  lexisEnabled: ifChanged(formData.lexisEnabled, tvc?.lexisEnabled),
  experianSubscriberCode: ifChanged(strOrNull(formData.experianSubscriberCode), strOrNull(tvc?.experianSubscriberCode)),
  middeskApiKey: newMiddeskApiKey(formData.middeskApiKey, !!tvc?.middeskApiKeyExists),
  neuroEnabled: ifChanged(formData.neuroEnabled, tvc?.neuroEnabled),
  sentilinkCredentials: newSentilinkCredentials(formData.sentilinkCredentials, !!tvc?.sentilinkCredentialsExists),
});
