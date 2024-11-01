import { BusinessDI, type DataIdentifier, DocumentDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useDITranslation = () => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });

  const translateDI = (di: DataIdentifier): string => {
    // Handle versioned document DIs by removing version
    if (di.includes(':')) {
      return translateDI(di.split(':')[0] as DataIdentifier);
    }

    // Handle ID DIs
    if (di === IdDI.firstName) return t('id.first_name');
    if (di === IdDI.middleName) return t('id.middle_name');
    if (di === IdDI.lastName) return t('id.last_name');
    if (di === IdDI.email) return t('id.email');
    if (di === IdDI.phoneNumber) return t('id.phone_number');
    if (di === IdDI.dob) return t('id.dob');
    if (di === IdDI.ssn9) return t('id.ssn9');
    if (di === IdDI.ssn4) return t('id.ssn4');
    if (di === IdDI.addressLine1) return t('id.address_line1');
    if (di === IdDI.addressLine2) return t('id.address_line2');
    if (di === IdDI.city) return t('id.city');
    if (di === IdDI.state) return t('id.state');
    if (di === IdDI.country) return t('id.country');
    if (di === IdDI.zip) return t('id.zip');
    if (di === IdDI.nationality) return t('id.nationality');
    if (di === IdDI.usLegalStatus) return t('id.us_legal_status');
    if (di === IdDI.visaKind) return t('id.visa_kind');
    if (di === IdDI.visaExpirationDate) return t('id.visa_expiration_date');
    if (di === IdDI.citizenships) return t('id.citizenships');
    if (di === IdDI.usTaxId) return t('id.us_tax_id');
    if (di === IdDI.itin) return t('id.itin');

    // Handle Business DIs
    if (di === BusinessDI.name) return t('business.name');
    if (di === BusinessDI.doingBusinessAs) return t('business.dba');
    if (di === BusinessDI.website) return t('business.website');
    if (di === BusinessDI.phoneNumber) return t('business.phone_number');
    if (di === BusinessDI.tin) return t('business.tin');
    if (di === BusinessDI.corporationType) return t('business.corporation_type');
    if (di === BusinessDI.beneficialOwners) return t('business.beneficial_owners');
    if (di === BusinessDI.kycedBeneficialOwners) return t('business.kyced_beneficial_owners');
    if (di === BusinessDI.addressLine1) return t('business.address_line1');
    if (di === BusinessDI.addressLine2) return t('business.address_line2');
    if (di === BusinessDI.city) return t('business.city');
    if (di === BusinessDI.state) return t('business.state');
    if (di === BusinessDI.country) return t('business.country');
    if (di === BusinessDI.zip) return t('business.zip');
    if (di === BusinessDI.formationState) return t('business.formation_state');
    if (di === BusinessDI.formationDate) return t('business.formation_date');

    // Handle Investor Profile DIs
    if (di === InvestorProfileDI.employmentStatus) return t('investor_profile.employment_status');
    if (di === InvestorProfileDI.occupation) return t('investor_profile.occupation');
    if (di === InvestorProfileDI.employer) return t('investor_profile.employer');
    if (di === InvestorProfileDI.annualIncome) return t('investor_profile.annual_income');
    if (di === InvestorProfileDI.netWorth) return t('investor_profile.net_worth');
    if (di === InvestorProfileDI.investmentGoals) return t('investor_profile.investment_goals');
    if (di === InvestorProfileDI.riskTolerance) return t('investor_profile.risk_tolerance');
    if (di === InvestorProfileDI.declarations) return t('investor_profile.declarations');
    if (di === InvestorProfileDI.seniorExecutiveSymbols) return t('investor_profile.senior_executive_symbols');
    if (di === InvestorProfileDI.familyMemberNames) return t('investor_profile.family_member_names');
    if (di === InvestorProfileDI.politicalOrganization) return t('investor_profile.political_organization');
    if (di === InvestorProfileDI.brokerageFirmEmployer) return t('investor_profile.brokerage_firm_employer');
    if (di === InvestorProfileDI.fundingSources) return t('investor_profile.funding_sources');

    // Handle Document DIs
    if (di === DocumentDI.finraComplianceLetter) return 'FINRA Compliance Letter';
    if (di === DocumentDI.latestPassport) return 'Passport';
    if (di === DocumentDI.latestPassportSelfie) return 'Passport selfie';
    if (di === DocumentDI.latestDriversLicenseFront) return "Driver's License";
    if (di === DocumentDI.latestDriversLicenseBack) return "Driver's License (Back)";
    if (di === DocumentDI.latestIdCardFront) return 'ID Card';
    if (di === DocumentDI.latestIdCardBack) return 'ID Card (Back)';
    if (di === DocumentDI.latestVisa) return 'Visa';
    if (di === DocumentDI.latestLeaseFront) return 'Lease';
    if (di === DocumentDI.latestBankStatementFront) return 'Bank Statement';
    if (di === DocumentDI.latestUtilityBillFront) return 'Utility Bill';
    if (di === DocumentDI.ssnCard) return 'SSN Card';
    if (di === DocumentDI.proofOfAddress) return 'Proof of Address';

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
