import { IcoForbid40 } from '@onefootprint/icons';
import { IdDocImageProcessingError, IdDocImageUploadError } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Logger } from '../../../../utils/logger';
import type { IdDocImageErrorType } from '../../types';
import PromptWithGuidelines from '../prompt-with-guidelines';

type ErrorProps = {
  sideName?: string;
  errors: IdDocImageErrorType[];
  docName?: string;
  countryName?: string;
};

const ErrorComponent = ({ errors, sideName, docName, countryName }: ErrorProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.error',
  });

  const imageErrorsSet: Set<IdDocImageProcessingError | IdDocImageUploadError> = new Set([
    ...Object.values(IdDocImageProcessingError),
    ...Object.values(IdDocImageUploadError),
  ]);

  const cleanedErrors = errors.filter(error => imageErrorsSet.has(error.errorType)) ?? [];
  if (cleanedErrors.length === 0) {
    Logger.error(
      `Detected unknown image processing (or upload) errors that doesn't exist on the list of defined image errors. Errors: ${errors
        .map(err => `${err}`)
        .join(', ')}`,
      { location: 'id-doc-error' },
    );
    cleanedErrors.push({ errorType: IdDocImageProcessingError.unknownError });
  }

  return (
    <PromptWithGuidelines
      icon={IcoForbid40}
      guidelines={cleanedErrors.map(error =>
        t(`description.${error.errorType}`, {
          documentType: docName,
          side: sideName,
          countryName,
          errorInfo: error.errorInfo,
        }),
      )}
      title={t('title')}
      variant="error"
    />
  );
};

export default ErrorComponent;
