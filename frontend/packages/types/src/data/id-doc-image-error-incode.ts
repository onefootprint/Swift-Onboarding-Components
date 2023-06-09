enum IdDocImageError {
  unknownDocumentType = 'unknown_document_type',
  wrongDocumentSide = 'wrong_document_side',
  wrongOneSidedDocument = 'wrong_one_sided_document',
  documentNotReadable = 'document_not_readable',
  unableToAlignDocument = 'unable_to_align_document',
  idTypeNotAcceptable = 'id_type_not_acceptable',
  selfieFaceNotFound = 'selfie_face_not_found',
  selfieLowConfidence = 'selfie_low_confidence',
  selfieTooDark = 'selfie_too_dark',
  selfieGlare = 'selfie_glare',
  selfieHasLenses = 'selfie_has_lenses',
  selfieHasFaceMask = 'selfie_has_face_mask',
  unknownError = 'unknown_error',
}

export default IdDocImageError;
