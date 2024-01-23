export enum IdDocImageTypes {
  front = 'front',
  back = 'back',
  selfie = 'selfie',
}

export enum SupportedIdDocTypes {
  idCard = 'id_card',
  driversLicense = 'drivers_license',
  passport = 'passport',
  visa = 'visa',
  workPermit = 'permit',
  residenceDocument = 'residence_document',
  voterIdentification = 'voter_identification',
  ssnCard = 'ssn_card',
  lease = 'lease',
  bankStatement = 'bank_statement',
  utilityBill = 'utility_bill'

}

export enum IdDocRegionality {
  international = 'international',
  usOnly = 'us_only',
}

export enum IdDocStatus {
  failed = 'failed',
  pending = 'pending',
  complete = 'complete',
}
