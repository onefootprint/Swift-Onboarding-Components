import { IdDocImageError } from '@onefootprint/types';

const BadImageErrorLabel: Record<IdDocImageError, string> = {
  [IdDocImageError.unknownDocumentType]:
    'We could not detect this document type. Please upload another valid document.',
  [IdDocImageError.wrongSide]:
    'Wrong side of the document detected. Please flip your ID and try again.',
  [IdDocImageError.invalidDocumentType]:
    'The document type was invalid. Please upload another valid document.',
  [IdDocImageError.documentNotReadable]:
    'Your document was not readable. Please try again.',
  [IdDocImageError.documentNotReadableGlare]:
    'Your document was not readable because of image glare. Please adjust the lighting and try again.',
  [IdDocImageError.unableToAlignDocument]:
    'One or more corners of the document not within the borders of the image. Note: This happens when the document is not centered in the frame and edges bleed past the frame of the picture.',
};

export default BadImageErrorLabel;
