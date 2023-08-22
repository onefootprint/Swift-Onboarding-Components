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
  residenceDocument = 'residence_document',
  workPermit = 'permit',
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
