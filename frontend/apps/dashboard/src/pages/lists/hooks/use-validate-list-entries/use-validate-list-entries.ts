import { ListKind } from '@onefootprint/types';
import { validate as isEmail } from 'isemail';
import { useTranslation } from 'react-i18next';

import isEmailDomain from './utils/is-email-domain';
import isIpAddress from './utils/is-ip-address';
import isPhoneCountryCode from './utils/is-phone-country-code';
import isPhoneNumber from './utils/is-phone-number';
import isSSN9 from './utils/is-ssn-9';

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
    if (kind === ListKind.emailAddress) {
      return values.every(val => isEmail(val)) ? undefined : t('email-address-invalid');
    }
    if (kind === ListKind.emailDomain) {
      return values.every(isEmailDomain) ? undefined : t('email-domain-invalid');
    }
    if (kind === ListKind.ssn9) {
      return values.every(isSSN9) ? undefined : t('ssn9-invalid');
    }
    if (kind === ListKind.phoneNumber) {
      return values.every(val => isPhoneNumber(val)) ? undefined : t('phone-number-invalid');
    }
    if (kind === ListKind.phoneCountryCode) {
      return values.every(isPhoneCountryCode) ? undefined : t('phone-country-code-invalid');
    }
    if (kind === ListKind.ipAddress) {
      return values.every(val => isIpAddress(val)) ? undefined : t('ip-address-invalid');
    }

    return undefined;
  };

  return validate;
};

export default useValidateListEntries;
