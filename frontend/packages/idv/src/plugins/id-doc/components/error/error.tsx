import { IcoForbid40 } from '@onefootprint/icons';
import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logger from '../../../../utils/logger';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import getImageSideLabel from '../../utils/get-image-side-label';
import type { IdDocImageErrorType } from '../../utils/state-machine';
import PromptWithGuidelines from '../prompt-with-directions';

type ErrorProps = {
  imageType: IdDocImageTypes;
  errors: IdDocImageErrorType[];
  docType: SupportedIdDocTypes;
  countryName: string;
};

const Error = ({ errors, imageType, docType, countryName }: ErrorProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'id-doc.components.error' });

  const side = getImageSideLabel(imageType, docType);

  const imageErrorsSet: Set<IdDocImageProcessingError | IdDocImageUploadError> =
    new Set([
      ...Object.values(IdDocImageProcessingError),
      ...Object.values(IdDocImageUploadError),
    ]);

  const cleanedErrors =
    errors.filter(error => imageErrorsSet.has(error.errorType)) ?? [];
  if (cleanedErrors.length === 0) {
    Logger.error(
      `Detected unknown image processing (or upload) errors that doesn't exist on the list of defined image errors. Errors: ${errors
        .map(err => `${err}`)
        .join(', ')}`,
      'id-doc-error',
    );
    cleanedErrors.push({ errorType: IdDocImageProcessingError.unknownError });
  }

  return (
    <PromptWithGuidelines
      icon={IcoForbid40}
      guidelines={cleanedErrors.map(error =>
        t(`description.${error.errorType}`, {
          documentType: IdDocTypeToLabel[docType],
          side,
          countryName,
          errorInfo: error.errorInfo,
        }),
      )}
      title={t(`title-${imageType}`)}
      variant="error"
    />
  );
};

export default Error;
