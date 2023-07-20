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

  latestPassport = 'document.passport.front.latest_upload',
  latestPassportSelfie = 'document.passport.selfie.latest_upload',
  passportFullName = 'document.passport.full_name',
  passportDOB = 'document.passport.dob',
  passportGender = 'document.passport.gender',
  passportFullAddress = 'document.passport.full_address',
  passportDocumentNumber = 'document.passport.document_number',
  passportIssuedAt = 'document.passport.issued_at',
  passportExpiresAt = 'document.passport.expires_at',
  passportIssuingState = 'document.passport.issuing_state',
  passportIssuingCountry = 'document.passport.issuing_country',
  passportRefNumber = 'document.passport.ref_number',
  latestDriversLicenseFront = 'document.drivers_license.front.latest_upload',
  latestDriversLicenseBack = 'document.drivers_license.back.latest_upload',
  latestDriversLicenseSelfie = 'document.drivers_license.selfie.latest_upload',
  driversLicenseFullName = 'document.drivers_license.full_name',
  driversLicenseDOB = 'document.drivers_license.dob',
  driversLicenseGender = 'document.drivers_license.gender',
  driversLicenseFullAddress = 'document.drivers_license.full_address',
  driversLicenseDocumentNumber = 'document.drivers_license.document_number',
  driversLicenseIssuedAt = 'document.drivers_license.issued_at',
  driversLicenseExpiresAt = 'document.drivers_license.expires_at',
  driversLicenseIssuingState = 'document.drivers_license.issuing_state',
  driversLicenseIssuingCountry = 'document.drivers_license.issuing_country',
  driversLicenseRefNumber = 'document.drivers_license.ref_number',
  latestIdCardFront = 'document.id_card.front.latest_upload',
  latestIdCardBack = 'document.id_card.back.latest_upload',
  latestIdCardSelfie = 'document.id_card.selfie.latest_upload',
  idCardFullName = 'document.id_card.full_name',
  idCardDOB = 'document.id_card.dob',
  idCardGender = 'document.id_card.gender',
  idCardFullAddress = 'document.id_card.full_address',
  idCardDocumentNumber = 'document.id_card.document_number',
  idCardIssuedAt = 'document.id_card.issued_at',
  idCardExpiresAt = 'document.id_card.expires_at',
  idCardIssuingState = 'document.id_card.issuing_state',
  idCardIssuingCountry = 'document.id_card.issuing_country',
  idCardRefNumber = 'document.id_card.ref_number',
}

export enum CardDIField {
  name = 'name',
  issuer = 'issuer',
  number = 'number',
  numberLast4 = 'number_last4',
  cvc = 'cvc',
  expiration = 'expiration',
  expirationMonth = 'expiration_month',
  expirationYear = 'expiration_year',
  zip = 'billing_address.zip',
  country = 'billing_address.country',
}

export type CardDI<T extends string = string> =
  | `card.${T}.${CardDIField.name}`
  | `card.${T}.${CardDIField.issuer}`
  | `card.${T}.${CardDIField.number}`
  | `card.${T}.${CardDIField.numberLast4}`
  | `card.${T}.${CardDIField.cvc}`
  | `card.${T}.${CardDIField.expiration}`
  | `card.${T}.${CardDIField.expirationMonth}`
  | `card.${T}.${CardDIField.expirationYear}`;

export type CustomDI<T extends string = string> = `custom.${T}`;

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
  | CardDI
  | CustomDI;
