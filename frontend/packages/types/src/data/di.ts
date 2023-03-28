export enum IdDocDI {
  driverLicense = 'id_document.driver_license',
  idCard = 'id_document.id_card',
  passport = 'id_document.passport',
  selfieDriverLicense = 'selfie.driver_license',
  selfiePassport = 'selfie.passport',
  selfieIdCard = 'selfie.id_card',
}

export enum BusinessDI {
  name = 'business.name',
  website = 'business.website',
  phoneNumber = 'business.phone_number',
  ein = 'business.ein',
  beneficialOwners = 'business.beneficial_owners',
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
  finraComplianceLetter = 'document.finra_compliance_letter',
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
}

export enum DocumentDI {
  finraComplianceLetter = 'document.finra_compliance_letter',
}

export type DataIdentifier =
  | IdDocDI
  | InvestorProfileDI
  | IdDI
  | BusinessDI
  | DocumentDI;
