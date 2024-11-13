import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useDITranslation = () => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });

  const translateDI = (di: DataIdentifier): string => {
    // Handle versioned document DIs by removing version
    if (di.includes(':')) {
      return translateDI(di.split(':')[0] as DataIdentifier);
    }

    // Handle ID DIs
    if (di === 'id.first_name') return t('id.first_name');
    if (di === 'id.middle_name') return t('id.middle_name');
    if (di === 'id.last_name') return t('id.last_name');
    if (di === 'id.email') return t('id.email');
    if (di === 'id.phone_number') return t('id.phone_number');
    if (di === 'id.dob') return t('id.dob');
    if (di === 'id.ssn9') return t('id.ssn9');
    if (di === 'id.ssn4') return t('id.ssn4');
    if (di === 'id.address_line1') return t('id.address_line1');
    if (di === 'id.address_line2') return t('id.address_line2');
    if (di === 'id.city') return t('id.city');
    if (di === 'id.state') return t('id.state');
    if (di === 'id.country') return t('id.country');
    if (di === 'id.zip') return t('id.zip');
    if (di === 'id.nationality') return t('id.nationality');
    if (di === 'id.us_legal_status') return t('id.us_legal_status');
    if (di === 'id.visa_kind') return t('id.visa_kind');
    if (di === 'id.visa_expiration_date') return t('id.visa_expiration_date');
    if (di === 'id.citizenships') return t('id.citizenships');
    if (di === 'id.us_tax_id') return t('id.us_tax_id');
    if (di === 'id.itin') return t('id.tin');

    // Handle Business DIs
    if (di === 'business.name') return t('business.name');
    if (di === 'business.dba') return t('business.dba');
    if (di === 'business.website') return t('business.website');
    if (di === 'business.phone_number') return t('business.phone_number');
    if (di === 'business.tin') return t('business.tin');
    if (di === 'business.corporation_type') return t('business.corporation_type');
    if (di === 'business.address_line1') return t('business.address_line1');
    if (di === 'business.address_line2') return t('business.address_line2');
    if (di === 'business.city') return t('business.city');
    if (di === 'business.state') return t('business.state');
    if (di === 'business.country') return t('business.country');
    if (di === 'business.zip') return t('business.zip');
    if (di === 'business.formation_state') return t('business.formation_state');
    if (di === 'business.formation_date') return t('business.formation_date');

    // Handle Investor Profile DIs
    if (di === 'investor_profile.employment_status') return t('investor_profile.employment_status');
    if (di === 'investor_profile.occupation') return t('investor_profile.occupation');
    if (di === 'investor_profile.employer') return t('investor_profile.employer');
    if (di === 'investor_profile.annual_income') return t('investor_profile.annual_income');
    if (di === 'investor_profile.net_worth') return t('investor_profile.net_worth');
    if (di === 'investor_profile.investment_goals') return t('investor_profile.investment_goals');
    if (di === 'investor_profile.risk_tolerance') return t('investor_profile.risk_tolerance');
    if (di === 'investor_profile.declarations') return t('investor_profile.declarations');
    if (di === 'investor_profile.senior_executive_symbols') return t('investor_profile.senior_executive_symbols');
    if (di === 'investor_profile.family_member_names') return t('investor_profile.family_member_names');
    if (di === 'investor_profile.political_organization') return t('investor_profile.political_organization');
    if (di === 'investor_profile.brokerage_firm_employer') return t('investor_profile.brokerage_firm_employer');
    if (di === 'investor_profile.funding_sources') return t('investor_profile.funding_sources');

    // Handle Document DIs
    const documentMappings: Record<string, string> = {
      'document.finra_compliance_letter': 'document.finra_compliance_letter',
      'document.ssn_card.image': 'document.ssn_card',
      'document.proof_of_address.image': 'document.proof_of_address.image',
    };

    if (documentMappings[di]) return t(documentMappings[di]);

    // Handle specific document fields
    const documentTypes = ['drivers_license', 'passport', 'passport_card', 'custom'];
    for (const type of documentTypes) {
      const prefix = `document.${type}.`;
      if (di.startsWith(prefix)) {
        const field = di.replace(prefix, '');
        return t(`document.${type}.${field}`);
      }
    }

    // Handle verified fields
    if (di.startsWith('id.verified_')) {
      const field = di.replace('id.verified_', '');
      return t(`id.${field}`);
    }

    // Handle Card DIs
    if (di.startsWith('card.') && di.includes('.name')) return t('card.name');
    if (di.startsWith('card.') && di.includes('.issuer')) return t('card.issuer');
    if (di.startsWith('card.') && di.includes('.number')) return t('card.number');
    if (di.startsWith('card.') && di.includes('.number_last4')) return t('card.number_last4');
    if (di.startsWith('card.') && di.includes('.cvc')) return t('card.cvc');
    if (di.startsWith('card.') && di.includes('.expiration')) return t('card.expiration');
    if (di.startsWith('card.') && di.includes('.expiration_month')) return t('card.expiration_month');
    if (di.startsWith('card.') && di.includes('.expiration_year')) return t('card.expiration_year');
    if (di.startsWith('card.') && di.includes('.billing_address.zip')) return t('card.billing_address.zip');
    if (di.startsWith('card.') && di.includes('.billing_address.country')) return t('card.billing_address.country');
    if (di.startsWith('card.') && di.includes('.fingerprint')) return t('card.fingerprint');

    // Handle Bank DIs
    if (di.startsWith('bank.') && di.includes('.name')) return t('bank.name');
    if (di.startsWith('bank.') && di.includes('.account_type')) return t('bank.account_type');
    if (di.startsWith('bank.') && di.includes('.ach_routing_number')) return t('bank.ach_routing_number');
    if (di.startsWith('bank.') && di.includes('.ach_account_number')) return t('bank.ach_account_number');
    if (di.startsWith('bank.') && di.includes('.ach_account_id')) return t('bank.ach_account_id');
    if (di.startsWith('bank.') && di.includes('.fingerprint')) return t('bank.fingerprint');

    // Handle Custom DIs
    if (di.startsWith('custom.')) {
      return di.replace('custom.', '');
    }

    return t(di);
  };

  return { translateDI };
};

export default useDITranslation;
