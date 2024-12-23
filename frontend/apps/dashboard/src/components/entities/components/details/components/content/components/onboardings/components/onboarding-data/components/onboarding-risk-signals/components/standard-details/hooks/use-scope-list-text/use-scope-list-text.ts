import type { SignalScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import { createCapitalStringList } from 'src/utils/create-string-list';

const useScopeListText = () => {
  const { t } = useTranslation('common', { keyPrefix: 'signal-attributes' });

  return (scopes: SignalScope[]) => {
    const map: Record<SignalScope, string> = {
      name: t('name'),
      dob: t('dob'),
      ssn: t('ssn'),
      itin: t('itin'),
      address: t('address'),
      street_address: t('street_address'),
      city: t('city'),
      state: t('state'),
      zip: t('zip'),
      country: t('country'),
      email: t('email'),
      phone_number: t('phone_number'),
      drivers_license_number: t('drivers_license_number'),
      ip_address: t('ip_address'),
      device: t('device'),
      native_device: t('native_device'),
      document: t('document'),
      selfie: t('selfie'),
      behavior: t('behavior'),
      business_address: t('business_address'),
      business_name: t('business_name'),
      business_phone_number: t('business_phone_number'),
      business_website: t('business_website'),
      business_tin: t('business_tin'),
      beneficial_owners: t('beneficial_owners'),
      business_dba: t('business_dba'),
    };
    const uniqueScopes = Array.from(new Set(scopes));
    const scopesList = uniqueScopes.map(scope => map[scope]);
    return createCapitalStringList(scopesList);
  };
};

export default useScopeListText;
