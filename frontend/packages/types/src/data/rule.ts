export enum RuleName {
  // Non-exhaustive list of FootprintReasonCodes, only ones used so far in playbook rules
  IdNotLocated = 'IdNotLocated',
  IdFlagged = 'IdFlagged',
  SubjectDeceased = 'SubjectDeceased',
  AddressInputIsPoBox = 'AddressInputIsPoBox',
  DobLocatedCoppaAlert = 'DobLocatedCoppaAlert',
  MultipleRecordsFound = 'MultipleRecordsFound',
  SsnPartiallyMatches = 'SsnPartiallyMatches',
  SsnInputIsInvalid = 'SsnInputIsInvalid',
  SsnLocatedIsInvalid = 'SsnLocatedIsInvalid',
  SsnIssuedPriorToDob = 'SsnIssuedPriorToDob',
  DocumentNotVerified = 'DocumentNotVerified',
  DocumentSelfieDoesNotMatch = 'DocumentSelfieDoesNotMatch',
  DocumentUploadFailed = 'DocumentUploadFailed',
  SsnNotProvided = 'SsnNotProvided',
  WatchlistHitOfac = 'WatchlistHitOfac',
  WatchlistHitNonSdn = 'WatchlistHitNonSdn',
  WatchlistHitPep = 'WatchlistHitPep',
  AdverseMediaHit = 'AdverseMediaHit',
  DocumentTypeMismatch = 'DocumentTypeMismatch',
  DocumentUnknownCountryCode = 'DocumentUnknownCountryCode',
  DocumentCountryCodeMismatch = 'DocumentCountryCodeMismatch',
  AddressDoesNotMatch = 'AddressDoesNotMatch',
  NameDoesNotMatch = 'NameDoesNotMatch',
  DobDoesNotMatch = 'DobDoesNotMatch',
  DocumentIsPermitOrProvisionalLicense = 'DocumentIsPermitOrProvisionalLicense',
}

export type Rule = {
  name: RuleName;
};
