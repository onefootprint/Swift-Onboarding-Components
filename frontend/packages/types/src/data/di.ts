export enum BusinessDI {
  name = 'business.name',
  doingBusinessAs = 'business.dba',
  website = 'business.website',
  phoneNumber = 'business.phone_number',
  tin = 'business.tin',
  corporationType = 'business.corporation_type',
  beneficialOwners = 'business.beneficial_owners',
  kycedBeneficialOwners = 'business.kyced_beneficial_owners',
  addressLine1 = 'business.address_line1',
  addressLine2 = 'business.address_line2',
  city = 'business.city',
  state = 'business.state',
  country = 'business.country',
  zip = 'business.zip',
}

export enum InvestorProfileDI {
  occupation = 'investor_profile.occupation',
  employedByBrokerageFirm = 'investor_profile.brokerage_firm_employer',
  annualIncome = 'investor_profile.annual_income',
  netWorth = 'investor_profile.net_worth',
  investmentGoals = 'investor_profile.investment_goals',
  riskTolerance = 'investor_profile.risk_tolerance',
  declarations = 'investor_profile.declarations',
}

export enum IdDI {
  firstName = 'id.first_name',
  lastName = 'id.last_name',
  email = 'id.email',
  phoneNumber = 'id.phone_number',
  dob = 'id.dob',
  ssn9 = 'id.ssn9',
  ssn4 = 'id.ssn4',
  addressLine1 = 'id.address_line1',
  addressLine2 = 'id.address_line2',
  city = 'id.city',
  state = 'id.state',
  country = 'id.country',
  zip = 'id.zip',
  nationality = 'id.nationality',
}

export enum DocumentDI {
  finraComplianceLetter = 'document.finra_compliance_letter',
  passport = 'document.passport',
  passportSelfie = 'document.passport.selfie',
  driversLicenseFront = 'document.drivers_license.front',
  driversLicenseBack = 'document.drivers_license.back',
  driversLicenseSelfie = 'document.drivers_license.selfie',
  idCardFront = 'document.id_card.front',
  idCardBack = 'document.id_card.back',
  idCardSelfie = 'document.id_card.selfie',

  latestPassport = 'document.passport.front.latest_upload',
  latestPassportSelfie = 'document.passport.selfie.latest_upload',
  latestDriversLicenseFront = 'document.drivers_license.front.latest_upload',
  latestDriversLicenseBack = 'document.drivers_license.back.latest_upload',
  latestDriversLicenseSelfie = 'document.drivers_license.selfie.latest_upload',
  latestIdCardFront = 'document.id_card.front.latest_upload',
  latestIdCardBack = 'document.id_card.back.latest_upload',
  latestIdCardSelfie = 'document.id_card.selfie.latest_upload',
}

export type CardDI<T extends string = string> =
  | `card.${T}.name`
  | `card.${T}.issuer`
  | `card.${T}.number`
  | `card.${T}.number_last4`
  | `card.${T}.cvc`
  | `card.${T}.expiration`
  | `card.${T}.expiration_month`
  | `card.${T}.expiration_year`;

export const DataIdentifierKeys = [
  ...Object.values(BusinessDI),
  ...Object.values(InvestorProfileDI),
  ...Object.values(IdDI),
  ...Object.values(DocumentDI),
];

export type DataIdentifier =
  | InvestorProfileDI
  | IdDI
  | BusinessDI
  | DocumentDI
  | CardDI;
