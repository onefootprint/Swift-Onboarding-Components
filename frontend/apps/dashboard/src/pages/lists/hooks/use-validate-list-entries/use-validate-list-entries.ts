import { isEmail, isEmailDomain, isIpAddress, isPhoneCountryCode, isPhoneNumber, isSsn9 } from '@onefootprint/core';
import type { ListKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useValidateListEntries = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'entries-validation',
  });

  const validate = (kind: ListKind, entries: string) => {
    if (!entries?.length) {
      return undefined;
    }
    const values = entries
      .trim()
      .split(',')
      .map(val => val.trim())
      .filter(val => val.length);

    if (!values.length || !kind) {
      return undefined;
    }

    // Apply different validations depending on the kind of list
    if (kind === 'email_address') {
      return values.every(val => isEmail(val)) ? undefined : t('email-address-invalid');
    }
    if (kind === 'email_domain') {
      return values.every(isEmailDomain) ? undefined : t('email-domain-invalid');
    }
    if (kind === 'ssn9') {
      return values.every(isSsn9) ? undefined : t('ssn9-invalid');
    }
    if (kind === 'phone_number') {
      return values.every(val => isPhoneNumber(val)) ? undefined : t('phone-number-invalid');
    }
    if (kind === 'phone_country_code') {
      return values.every(isPhoneCountryCode) ? undefined : t('phone-country-code-invalid');
    }
    if (kind === 'ip_address') {
      return values.every(val => isIpAddress(val)) ? undefined : t('ip-address-invalid');
    }
    return undefined;
  };
  return validate;
};

export default useValidateListEntries;
