import { IdDocImageProcessingError } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useFailureReasonText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.failure-reasons',
  });

  return (reason: IdDocImageProcessingError) => {
    if (reason === IdDocImageProcessingError.docTypeMismatch) {
      return t('doc-type-mismatch');
    }
    if (reason === IdDocImageProcessingError.unknownDocumentType) {
      return t('unknown-document-type');
    }
    if (reason === IdDocImageProcessingError.unsupportedDocumentType) {
      return t('unsupported-document-type');
    }
    if (reason === IdDocImageProcessingError.wrongDocumentSide) {
      return t('wrong-document-side');
    }
    if (reason === IdDocImageProcessingError.wrongOneSidedDocument) {
      return t('wrong-one-sided-document');
    }
    if (reason === IdDocImageProcessingError.documentNotReadable) {
      return t('document-not-readable');
    }
    if (reason === IdDocImageProcessingError.documentGlare) {
      return t('document-glare');
    }
    if (reason === IdDocImageProcessingError.documentSharpness) {
      return t('document-sharpness');
    }
    if (reason === IdDocImageProcessingError.unableToAlignDocument) {
      return t('unable-to-align-document');
    }
    if (reason === IdDocImageProcessingError.idTypeNotAcceptable) {
      return t('id-type-not-acceptable');
    }
    if (reason === IdDocImageProcessingError.unknownCountryCode) {
      return t('unknown-country-code');
    }
    if (reason === IdDocImageProcessingError.countryCodeMismatch) {
      return t('country-code-mismatch');
    }
    if (reason === IdDocImageProcessingError.selfieFaceNotFound) {
      return t('selfie-face-not-found');
    }
    if (reason === IdDocImageProcessingError.selfieLowConfidence) {
      return t('selfie-low-confidence');
    }
    if (reason === IdDocImageProcessingError.selfieTooDark) {
      return t('selfie-too-dark');
    }
    if (reason === IdDocImageProcessingError.selfieGlare) {
      return t('selfie-glare');
    }
    if (reason === IdDocImageProcessingError.selfieHasLenses) {
      return t('selfie-has-lenses');
    }
    if (reason === IdDocImageProcessingError.selfieHasFaceMask) {
      return t('selfie-has-face-mask');
    }
    if (reason === IdDocImageProcessingError.selfieBlurry) {
      return t('selfie-blurry');
    }
    if (reason === IdDocImageProcessingError.selfieImageSizeUnsupported) {
      return t('selfie-image-size-unsupported');
    }
    if (reason === IdDocImageProcessingError.selfieImageOrientationIncorrect) {
      return t('selfie-image-orientation-incorrect');
    }
    if (reason === IdDocImageProcessingError.selfieBadImageCompression) {
      return t('selfie-bad-image-compression');
    }
    if (reason === IdDocImageProcessingError.driversLicensePermitNotAllowed) {
      return t('drivers-license-permit-not-allowed');
    }
    if (reason === IdDocImageProcessingError.unknownError) {
      return t('unknown-error');
    }
    if (reason === IdDocImageProcessingError.networkError) {
      return t('network-error');
    }
    if (reason === IdDocImageProcessingError.faceNotFound) {
      return t('face-not-found');
    }
    if (reason === IdDocImageProcessingError.militaryIdNotAllowed) {
      return t('military-id-not-allowed');
    }
  };
};

export default useFailureReasonText;
