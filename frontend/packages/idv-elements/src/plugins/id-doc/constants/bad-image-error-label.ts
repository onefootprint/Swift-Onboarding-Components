import { IdDocBadImageError } from '@onefootprint/types';

const BadImageErrorLabel: Record<IdDocBadImageError, string> = {
  [IdDocBadImageError.imageTooSmall]:
    'The image resolution is too low for processing. Please upload a higher resolution image.',
  [IdDocBadImageError.documentMissingFourCorners]:
    'One or more corners of the document not within the borders of the image. Note: This happens when the document is not centered in the frame and edges bleed past the frame of the picture.',
  [IdDocBadImageError.documentTooSmall]:
    'Document image too small within frame. Note: This happens when a scanner is used to capture the image.',
  [IdDocBadImageError.documentBorderTooSmall]:
    'Document does not have enough high contrast border region. Note: This happens when the document is larger than the edges and there is not enough border that the cropping tool can use.',
  [IdDocBadImageError.faceImageNotDetected]:
    'The image of your face on the document is not correctly sized, well-lit, or in-focus on the front of photo ID image.',
  [IdDocBadImageError.barcodeNotDetected]:
    'The barcode on the back of the document is missing, damaged, covered, not in focus, not well-lit, or has incorrect format',
  [IdDocBadImageError.imageError]:
    'One of the following issues occurred: loading the document failed, document picture depth was invalid, there was too much glare or the image does not meet sharpness requirements.',
  [IdDocBadImageError.invalidJpeg]:
    'The image was submitted in a format that cannot be processed. Please submit a JPEG.',
  [IdDocBadImageError.documentIsSkewed]:
    'The document corner is rotated more than 100 degrees.',

  [IdDocBadImageError.internalError]:
    'There was an error processing your document. Please try again.',
};

export default BadImageErrorLabel;
