import { useTranslation } from 'react-i18next';
import type { Option, SsnOption } from '../../collected-information.types';

const useInfoLabel = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.collected-data' });
  const map: Partial<Record<keyof Option, string>> = {
    name: t('name'),
    dob: t('dob'),
    email: t('email'),
    fullAddress: t('full-address'),
    idDocKind: t('id-doc-kind'),
    phoneNumber: t('phone-number'),
    selfie: t('selfie'),
    ssn: t('ssn'),
    usTaxIdAcceptable: t('us-tax-id-acceptable'),
    usLegalStatus: t('us-legal-status'),
    countriesRestrictions: t('countries-restrictions'),
    internationalCountryRestrictions: t('international-country-restrictions'),
    businessName: t('business-name'),
    businessAddress: t('business-address'),
    businessTin: t('business-tin'),
    businessPhoneNumber: t('business-phone-number'),
    businessWebsite: t('business-website'),
    businessType: t('business-type'),
    businessBeneficialOwners: t('business-beneficial-owners'),
    enhancedAml: t('enhanced-aml'),
    ofac: t('ofac'),
    pep: t('pep'),
    adverseMedia: t('adverse-media'),
    phoneOTP: t('phone-otp'),
    emailOTP: t('email-otp'),
    emailAddress: t('email-address'),
  };

  const isSsnOption = (value: unknown): value is SsnOption => {
    return typeof value === 'object' && value !== null && 'kind' in value;
  };

  return (key: keyof Option, value?: Option[keyof Option]): string => {
    if (isSsnOption(value)) {
      const { optional, kind } = value;
      const kindText = kind === 'ssn4' ? t('ssn4') : t('ssn9');
      const optionalText = optional ? ` ⋅ ${t('optional-label')}` : '';
      return `${t('ssn')} (${kindText})${optionalText}`;
    }

    return map[key] || '';
  };
};

export default useInfoLabel;
