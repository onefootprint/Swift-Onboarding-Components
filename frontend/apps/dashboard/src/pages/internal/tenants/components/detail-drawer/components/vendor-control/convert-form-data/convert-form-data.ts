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
});
