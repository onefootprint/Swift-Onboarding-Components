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
  formationState = 'business.formation_state',
  formationDate = 'business.formation_date',
}

export enum InvestorProfileDI {
  employmentStatus = 'investor_profile.employment_status',
  occupation = 'investor_profile.occupation',
  employer = 'investor_profile.employer',
  annualIncome = 'investor_profile.annual_income',
  netWorth = 'investor_profile.net_worth',
  investmentGoals = 'investor_profile.investment_goals',
  riskTolerance = 'investor_profile.risk_tolerance',
  declarations = 'investor_profile.declarations',
  seniorExecutiveSymbols = 'investor_profile.senior_executive_symbols',
  familyMemberNames = 'investor_profile.family_member_names',
  politicalOrganization = 'investor_profile.political_organization',
  brokerageFirmEmployer = 'investor_profile.brokerage_firm_employer',
}

export enum IdDI {
  firstName = 'id.first_name',
  middleName = 'id.middle_name',
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
  usLegalStatus = 'id.us_legal_status',
  visaKind = 'id.visa_kind',
  visaExpirationDate = 'id.visa_expiration_date',
  citizenships = 'id.citizenships',
}

export enum DocumentDI {
  finraComplianceLetter = 'document.finra_compliance_letter',

  // TODO: we should migrate these away from `.latest_upload` to `.image`
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
  passportNationality = 'document.passport.nationality',
  passportClassifiedDocumentType = 'document.passport.classifed_document_type',
  passportCurp = 'document.passport.curp',
  passportCurpValidationResponse = 'document.passport.curp_validation_response',

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
  driversLicenseNationality = 'document.drivers_license.nationality',
  driversLicenseClassifiedDocumentType = 'document.drivers_license.classifed_document_type',
  driversLicenseCurp = 'document.drivers_license.curp',
  driversLicenseCurpValidationResponse = 'document.drivers_license.curp_validation_response',

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
  idCardNationality = 'document.id_card.nationality',
  idCardClassifiedDocumentType = 'document.id_card.classifed_document_type',
  idCardCurp = 'document.id_card.curp',
  idCardCurpValidationResponse = 'document.id_card.curp_validation_response',

  latestVisa = 'document.visa.front.latest_upload',
  latestVisaSelfie = 'document.visa.selfie.latest_upload',
  visaFullName = 'document.visa.full_name',
  visaDOB = 'document.visa.dob',
  visaGender = 'document.visa.gender',
  visaFullAddress = 'document.visa.full_address',
  visaDocumentNumber = 'document.visa.document_number',
  visaIssuedAt = 'document.visa.issued_at',
  visaExpiresAt = 'document.visa.expires_at',
  visaIssuingState = 'document.visa.issuing_state',
  visaIssuingCountry = 'document.visa.issuing_country',
  visaRefNumber = 'document.visa.ref_number',
  visaNationality = 'document.visa.nationality',
  visaClassifiedDocumentType = 'document.visa.classifed_document_type',
  visaCurp = 'document.visa.curp',
  visaCurpValidationResponse = 'document.visa.curp_validation_response',

  latestResidenceDocumentFront = 'document.residence_document.front.latest_upload',
  latestResidenceDocumentBack = 'document.residence_document.back.latest_upload',
  latestResidenceDocumentSelfie = 'document.residence_document.selfie.latest_upload',
  residenceDocumentFullName = 'document.residence_document.full_name',
  residenceDocumentDOB = 'document.residence_document.dob',
  residenceDocumentGender = 'document.residence_document.gender',
  residenceDocumentFullAddress = 'document.residence_document.full_address',
  residenceDocumentDocumentNumber = 'document.residence_document.document_number',
  residenceDocumentIssuedAt = 'document.residence_document.issued_at',
  residenceDocumentExpiresAt = 'document.residence_document.expires_at',
  residenceDocumentIssuingState = 'document.residence_document.issuing_state',
  residenceDocumentIssuingCountry = 'document.residence_document.issuing_country',
  residenceDocumentRefNumber = 'document.residence_document.ref_number',
  residenceDocumentNationality = 'document.residence_document.nationality',
  residenceDocumentClassifiedDocumentType = 'document.residence_document.classifed_document_type',
  residenceDocumentCurp = 'document.residence_document.curp',
  residenceDocumentCurpValidationResponse = 'document.residence_document.curp_validation_response',

  latestWorkPermitFront = 'document.permit.front.latest_upload',
  latestWorkPermitBack = 'document.permit.back.latest_upload',
  latestWorkPermitSelfie = 'document.permit.selfie.latest_upload',
  workPermitFullName = 'document.permit.full_name',
  workPermitDOB = 'document.permit.dob',
  workPermitGender = 'document.permit.gender',
  workPermitFullAddress = 'document.permit.full_address',
  workPermitDocumentNumber = 'document.permit.document_number',
  workPermitIssuedAt = 'document.permit.issued_at',
  workPermitExpiresAt = 'document.permit.expires_at',
  workPermitIssuingState = 'document.permit.issuing_state',
  workPermitIssuingCountry = 'document.permit.issuing_country',
  workPermitRefNumber = 'document.permit.ref_number',
  workPermitNationality = 'document.permit.nationality',
  workPermitClassifiedDocumentType = 'document.permit.classifed_document_type',
  workPermitCurp = 'document.permit.curp',
  workPermitCurpValidationResponse = 'document.permit.curp_validation_response',

  latestVoterIdentificationFront = 'document.voter_identification.front.latest_upload',
  latestVoterIdentificationBack = 'document.voter_identification.back.latest_upload',
  latestVoterIdentificationSelfie = 'document.voter_identification.selfie.latest_upload',
  voterIdentificationFullName = 'document.voter_identification.full_name',
  voterIdentificationDOB = 'document.voter_identification.dob',
  voterIdentificationGender = 'document.voter_identification.gender',
  voterIdentificationFullAddress = 'document.voter_identification.full_address',
  voterIdentificationDocumentNumber = 'document.voter_identification.document_number',
  voterIdentificationIssuedAt = 'document.voter_identification.issued_at',
  voterIdentificationExpiresAt = 'document.voter_identification.expires_at',
  voterIdentificationIssuingState = 'document.voter_identification.issuing_state',
  voterIdentificationIssuingCountry = 'document.voter_identification.issuing_country',
  voterIdentificationRefNumber = 'document.voter_identification.ref_number',
  voterIdentificationNationality = 'document.voter_identification.nationality',
  voterIdentificationClassifiedDocumentType = 'document.voter_identification.classifed_document_type',
  voterIdentificationCurp = 'document.voter_identification.curp',
  voterIdentificationCurpValidationResponse = 'document.voter_identification.curp_validation_response',

  latestPassportCardFront = 'document.passport_card.front.latest_upload',
  latestPassportCardBack = 'document.passport_card.back.latest_upload',
  latestPassportCardSelfie = 'document.passport_card.selfie.latest_upload',
  passportCardFullName = 'document.passport_card.full_name',
  passportCardDOB = 'document.passport_card.dob',
  passportCardGender = 'document.passport_card.gender',
  passportCardFullAddress = 'document.passport_card.full_address',
  passportCardDocumentNumber = 'document.passport_card.document_number',
  passportCardIssuedAt = 'document.passport_card.issued_at',
  passportCardExpiresAt = 'document.passport_card.expires_at',
  passportCardIssuingState = 'document.passport_card.issuing_state',
  passportCardIssuingCountry = 'document.passport_card.issuing_country',
  passportCardRefNumber = 'document.passport_card.ref_number',
  passportCardNationality = 'document.passport_card.nationality',
  passportCardClassifiedDocumentType = 'document.passport_card.classifed_document_type',
  passportCardCurp = 'document.passport_card.curp',
  passportCardCurpValidationResponse = 'document.passport_card.curp_validation_response',

  latestLeaseFront = 'document.lease.front.image',
  latestBankStatementFront = 'document.bank_statement.front.image',
  latestUtilityBillFront = 'document.utility_bill.front.image',
  ssnCard = 'document.ssn_card.image',
  proofOfAddress = 'document.proof_of_address.image',
}

export type VersionedDocumentDI<Version extends string = string> =
  | `${DocumentDI.latestPassport}:${Version}`
  | `${DocumentDI.latestPassportSelfie}:${Version}`
  | `${DocumentDI.passportFullName}:${Version}`
  | `${DocumentDI.passportDOB}:${Version}`
  | `${DocumentDI.passportGender}:${Version}`
  | `${DocumentDI.passportFullAddress}:${Version}`
  | `${DocumentDI.passportDocumentNumber}:${Version}`
  | `${DocumentDI.passportIssuedAt}:${Version}`
  | `${DocumentDI.passportExpiresAt}:${Version}`
  | `${DocumentDI.passportIssuingState}:${Version}`
  | `${DocumentDI.passportIssuingCountry}:${Version}`
  | `${DocumentDI.passportRefNumber}:${Version}`
  | `${DocumentDI.passportNationality}:${Version}`
  | `${DocumentDI.passportClassifiedDocumentType}:${Version}`
  | `${DocumentDI.latestDriversLicenseFront}:${Version}`
  | `${DocumentDI.latestDriversLicenseBack}:${Version}`
  | `${DocumentDI.latestDriversLicenseSelfie}:${Version}`
  | `${DocumentDI.driversLicenseFullName}:${Version}`
  | `${DocumentDI.driversLicenseDOB}:${Version}`
  | `${DocumentDI.driversLicenseGender}:${Version}`
  | `${DocumentDI.driversLicenseFullAddress}:${Version}`
  | `${DocumentDI.driversLicenseDocumentNumber}:${Version}`
  | `${DocumentDI.driversLicenseIssuedAt}:${Version}`
  | `${DocumentDI.driversLicenseExpiresAt}:${Version}`
  | `${DocumentDI.driversLicenseIssuingState}:${Version}`
  | `${DocumentDI.driversLicenseIssuingCountry}:${Version}`
  | `${DocumentDI.driversLicenseRefNumber}:${Version}`
  | `${DocumentDI.driversLicenseNationality}:${Version}`
  | `${DocumentDI.driversLicenseClassifiedDocumentType}:${Version}`
  | `${DocumentDI.latestIdCardFront}:${Version}`
  | `${DocumentDI.latestIdCardBack}:${Version}`
  | `${DocumentDI.latestIdCardSelfie}:${Version}`
  | `${DocumentDI.idCardFullName}:${Version}`
  | `${DocumentDI.idCardDOB}:${Version}`
  | `${DocumentDI.idCardGender}:${Version}`
  | `${DocumentDI.idCardFullAddress}:${Version}`
  | `${DocumentDI.idCardDocumentNumber}:${Version}`
  | `${DocumentDI.idCardIssuedAt}:${Version}`
  | `${DocumentDI.idCardExpiresAt}:${Version}`
  | `${DocumentDI.idCardIssuingState}:${Version}`
  | `${DocumentDI.idCardIssuingCountry}:${Version}`
  | `${DocumentDI.idCardRefNumber}:${Version}`
  | `${DocumentDI.idCardNationality}:${Version}`
  | `${DocumentDI.idCardClassifiedDocumentType}:${Version}`
  | `${DocumentDI.visaFullName}:${Version}`
  | `${DocumentDI.visaDOB}:${Version}`
  | `${DocumentDI.visaGender}:${Version}`
  | `${DocumentDI.visaFullAddress}:${Version}`
  | `${DocumentDI.visaDocumentNumber}:${Version}`
  | `${DocumentDI.visaIssuedAt}:${Version}`
  | `${DocumentDI.visaExpiresAt}:${Version}`
  | `${DocumentDI.visaIssuingState}:${Version}`
  | `${DocumentDI.visaIssuingCountry}:${Version}`
  | `${DocumentDI.visaRefNumber}:${Version}`
  | `${DocumentDI.visaNationality}:${Version}`
  | `${DocumentDI.visaClassifiedDocumentType}:${Version}`
  | `${DocumentDI.residenceDocumentFullName}:${Version}`
  | `${DocumentDI.residenceDocumentDOB}:${Version}`
  | `${DocumentDI.residenceDocumentGender}:${Version}`
  | `${DocumentDI.residenceDocumentFullAddress}:${Version}`
  | `${DocumentDI.residenceDocumentDocumentNumber}:${Version}`
  | `${DocumentDI.residenceDocumentIssuedAt}:${Version}`
  | `${DocumentDI.residenceDocumentExpiresAt}:${Version}`
  | `${DocumentDI.residenceDocumentIssuingState}:${Version}`
  | `${DocumentDI.residenceDocumentIssuingCountry}:${Version}`
  | `${DocumentDI.residenceDocumentRefNumber}:${Version}`
  | `${DocumentDI.residenceDocumentNationality}:${Version}`
  | `${DocumentDI.residenceDocumentClassifiedDocumentType}:${Version}`
  | `${DocumentDI.workPermitFullName}:${Version}`
  | `${DocumentDI.workPermitDOB}:${Version}`
  | `${DocumentDI.workPermitGender}:${Version}`
  | `${DocumentDI.workPermitFullAddress}:${Version}`
  | `${DocumentDI.workPermitDocumentNumber}:${Version}`
  | `${DocumentDI.workPermitIssuedAt}:${Version}`
  | `${DocumentDI.workPermitExpiresAt}:${Version}`
  | `${DocumentDI.workPermitIssuingState}:${Version}`
  | `${DocumentDI.workPermitIssuingCountry}:${Version}`
  | `${DocumentDI.workPermitRefNumber}:${Version}`
  | `${DocumentDI.workPermitNationality}:${Version}`
  | `${DocumentDI.workPermitClassifiedDocumentType}:${Version}`
  | `${DocumentDI.voterIdentificationFullName}:${Version}`
  | `${DocumentDI.voterIdentificationDOB}:${Version}`
  | `${DocumentDI.voterIdentificationGender}:${Version}`
  | `${DocumentDI.voterIdentificationFullAddress}:${Version}`
  | `${DocumentDI.voterIdentificationDocumentNumber}:${Version}`
  | `${DocumentDI.voterIdentificationIssuedAt}:${Version}`
  | `${DocumentDI.voterIdentificationExpiresAt}:${Version}`
  | `${DocumentDI.voterIdentificationIssuingState}:${Version}`
  | `${DocumentDI.voterIdentificationIssuingCountry}:${Version}`
  | `${DocumentDI.voterIdentificationRefNumber}:${Version}`
  | `${DocumentDI.voterIdentificationNationality}:${Version}`
  | `${DocumentDI.voterIdentificationClassifiedDocumentType}:${Version}`;

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

export type CustomDocumentIdentifier<T extends string = string> =
  `document.custom.${T}`;

export type CustomDI<T extends string = string> =
  | `custom.${T}`
  | CustomDocumentIdentifier<T>;

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
  | VersionedDocumentDI
  | CardDI
  | CustomDI;
