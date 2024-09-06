import { useTranslation } from 'react-i18next';
import type { Option } from '../../collected-information.types';

const useInfoLabel = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks.collected-data' });
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

  return (key: keyof Option, value?: Option[keyof Option]): string => {
    if (value && typeof value === 'object' && 'kind' in value) {
      return t(value.kind === 'ssn9' ? 'ssn-9' : 'ssn-4');
    }
    return map[key] || '';
  };
};

export default useInfoLabel;
