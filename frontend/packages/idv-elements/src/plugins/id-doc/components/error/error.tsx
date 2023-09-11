import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { imageIcons } from '../../constants/image-types';
import getImageSideLabel from '../../utils/get-image-side-label';
import FeedbackIcon from '../feedback-icon';

type ErrorProps = {
  imageType: IdDocImageTypes;
  errors: (IdDocImageProcessingError | IdDocImageUploadError)[];
  docType: SupportedIdDocTypes;
  countryName: string;
  backgroundColor?: 'primary' | 'secondary';
};

const Error = ({
  errors,
  imageType,
  docType,
  countryName,
  backgroundColor = 'primary',
}: ErrorProps) => {
  const { t } = useTranslation('components.error');

  const side = getImageSideLabel(imageType, docType);

  const imageErrorsSet: Set<IdDocImageProcessingError | IdDocImageUploadError> =
    new Set([
      ...Object.values(IdDocImageProcessingError),
      ...Object.values(IdDocImageUploadError),
    ]);

  const cleanedErrors = errors.filter(error => imageErrorsSet.has(error)) ?? [];
  if (cleanedErrors.length === 0) {
    console.error(
      `Detected unknown image processing (or upload) errors that doesn't exist on the list of defined image errors. Errors: ${errors
        .map(err => `${err}`)
        .join(', ')}`,
    );
    cleanedErrors.push(IdDocImageProcessingError.unknownError);
  }

  return (
    <Container>
      <NavigationHeader />
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType], color: 'error' }}
        statusIndicator={{
          component: <IcoWarning16 color="error" />,
          status: 'error',
          backgroundColor,
        }}
      />
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
            {t(`description.${cleanedErrors[0]}`, {
              documentType: IdDocTypeToLabel[docType],
              side,
              countryName,
            })}
          </Typography>
        ) : (
          cleanedErrors.map(error => (
            <Typography
              key={error}
              variant="body-2"
              color="secondary"
              as="li"
              sx={{
                textAlign: 'left',
                width: '100%',
              }}
            >
              {t(`description.${error}`, {
                documentType: IdDocTypeToLabel[docType],
                side,
                countryName,
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
