enum IdScanBadImageError {
  // The submitted image does not meet the minimum required
  // resolution needed for processing.
  imageTooSmall = 'image_too_small',

  // One or more corners of the document not within the borders
  // of the image. Note: This happens when the document is not
  // centered in the frame and edges bleed past the frame of
  // the picture.
  documentMissingFourCorners = 'document_missing_four_corners',

  // Document image too small within frame. Note: This happens
  // when a scanner is used to capture the image.
  documentTooSmall = 'document_too_small',

  // Document does not have enough high contrast border region.
  // Note: This happens when the document is larger than the edges
  // and there is not enough border that the cropping tool can use.
  documentBorderTooSmall = 'document_border_too_small',

  // The image of the Face on the document is not correctly sized,
  // well-lit, or in-focus on the front of photo ID image.
  faceImageNotDetected = 'face_image_not_detected',

  // The barcode on the back of the document is missing, damaged,
  // covered, not in focus, not well-lit, or is not PDF417.
  barcodeNotDetected = 'barcode_not_detected',

  // One of the following issues occurred:
  // (1) Document Image Load Error,
  // (2) Invalid or Unsupported Document Picture Depth,
  // (3) Too much glare in image,
  // (4) Image does not meet sharpness requirements
  imageError = 'image_error',

  // The JPEG structure check failed (image submitted in format
  // that cannot be processed).
  invalidJpeg = 'invalid_jpeg',

  // The document corner is rotated more than 100 degrees.
  documentIsSkewed = 'document_is_skewed',
}

export default IdScanBadImageError;
