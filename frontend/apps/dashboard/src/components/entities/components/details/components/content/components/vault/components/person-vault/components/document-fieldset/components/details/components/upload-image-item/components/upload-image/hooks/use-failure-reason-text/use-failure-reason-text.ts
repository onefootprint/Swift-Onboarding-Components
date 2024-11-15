import { IdDocImageProcessingError } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useFailureReasonText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.failure-reasons',
  });

  const errorToText: Record<IdDocImageProcessingError, string> = {
    [IdDocImageProcessingError.docTypeMismatch]: t('doc-type-mismatch'),
    [IdDocImageProcessingError.unknownDocumentType]: t('unknown-document-type'),
    [IdDocImageProcessingError.unsupportedDocumentType]: t('unsupported-document-type'),
    [IdDocImageProcessingError.wrongDocumentSide]: t('wrong-document-side'),
    [IdDocImageProcessingError.wrongOneSidedDocument]: t('wrong-one-sided-document'),
    [IdDocImageProcessingError.documentNotReadable]: t('document-not-readable'),
    [IdDocImageProcessingError.documentGlare]: t('document-glare'),
    [IdDocImageProcessingError.documentSharpness]: t('document-sharpness'),
    [IdDocImageProcessingError.unableToAlignDocument]: t('unable-to-align-document'),
    [IdDocImageProcessingError.idTypeNotAcceptable]: t('id-type-not-acceptable'),
    [IdDocImageProcessingError.unknownCountryCode]: t('unknown-country-code'),
    [IdDocImageProcessingError.countryCodeMismatch]: t('country-code-mismatch'),
    [IdDocImageProcessingError.selfieFaceNotFound]: t('selfie-face-not-found'),
    [IdDocImageProcessingError.selfieLowConfidence]: t('selfie-low-confidence'),
    [IdDocImageProcessingError.selfieTooDark]: t('selfie-too-dark'),
    [IdDocImageProcessingError.selfieGlare]: t('selfie-glare'),
    [IdDocImageProcessingError.selfieHasLenses]: t('selfie-has-lenses'),
    [IdDocImageProcessingError.selfieHasFaceMask]: t('selfie-has-face-mask'),
    [IdDocImageProcessingError.selfieBlurry]: t('selfie-blurry'),
    [IdDocImageProcessingError.selfieImageSizeUnsupported]: t('selfie-image-size-unsupported'),
    [IdDocImageProcessingError.selfieImageOrientationIncorrect]: t('selfie-image-orientation-incorrect'),
    [IdDocImageProcessingError.selfieBadImageCompression]: t('selfie-bad-image-compression'),
    [IdDocImageProcessingError.driversLicensePermitNotAllowed]: t('drivers-license-permit-not-allowed'),
    [IdDocImageProcessingError.unknownError]: t('unknown-error'),
    [IdDocImageProcessingError.networkError]: t('network-error'),
    [IdDocImageProcessingError.faceNotFound]: t('face-not-found'),
    [IdDocImageProcessingError.militaryIdNotAllowed]: t('military-id-not-allowed'),
  };

  return (reason: IdDocImageProcessingError) => t('preface', { reason: errorToText[reason] });
};

export default useFailureReasonText;
