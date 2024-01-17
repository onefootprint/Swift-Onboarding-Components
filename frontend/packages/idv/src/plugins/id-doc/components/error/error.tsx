import { IcoForbid40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logger from '../../../../utils/logger';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import getImageSideLabel from '../../utils/get-image-side-label';
import type { IdDocImageErrorType } from '../../utils/state-machine';

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
    <Container>
      <IcoForbid40 color="error" />
      <ErrorMessage>
        <Typography
          variant="label-1"
          color="error"
          sx={{ textAlign: 'center' }}
        >
          {t(`title-${imageType}`)}
        </Typography>
        {cleanedErrors.length < 2 ? (
          <Typography
            variant="body-2"
            color="secondary"
            sx={{
              textAlign: 'center',
            }}
          >
            {t(`description.${cleanedErrors[0].errorType}`, {
              documentType: IdDocTypeToLabel[docType],
              side,
              countryName,
              errorInfo: cleanedErrors[0].errorInfo,
            })}
          </Typography>
        ) : (
          cleanedErrors.map(error => (
            <Typography
              key={error.errorType}
              variant="body-2"
              color="secondary"
              as="li"
              sx={{
                textAlign: 'left',
                width: '100%',
              }}
            >
              {t(`description.${error.errorType}`, {
                documentType: IdDocTypeToLabel[docType],
                side,
                countryName,
                errorInfo: error.errorInfo,
              })}
            </Typography>
          ))
        )}
      </ErrorMessage>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
  `}
`;

const ErrorMessage = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default Error;
