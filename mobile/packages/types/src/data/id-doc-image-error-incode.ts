enum IdDocImageError {
  docTypeMismatch = 'doc_type_mismatch',
  unknownDocumentType = 'unknown_document_type',
  unsupportedDocumentType = 'unsupported_document_type',
  wrongDocumentSide = 'wrong_document_side',
  wrongOneSidedDocument = 'wrong_one_sided_document',
  documentNotReadable = 'document_not_readable',
  documentGlare = 'document_glare',
  documentSharpness = 'document_sharpness',
  unableToAlignDocument = 'unable_to_align_document',
  idTypeNotAcceptable = 'id_type_not_acceptable',
  unknownCountryCode = 'unknown_country_code',
  countryCodeMismatch = 'country_code_mismatch',
  selfieFaceNotFound = 'selfie_face_not_found',
  selfieLowConfidence = 'selfie_low_confidence',
  selfieTooDark = 'selfie_too_dark',
  selfieGlare = 'selfie_glare',
  selfieHasLenses = 'selfie_has_lenses',
  selfieHasFaceMask = 'selfie_has_face_mask',
  unknownError = 'unknown_error',
}

export default IdDocImageError;
