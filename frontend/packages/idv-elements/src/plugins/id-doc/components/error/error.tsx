import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  IdDocImageError,
  IdDocImageTypes,
  IdDocType,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { imageIcons } from '../../constants/image-types';
import FeedbackIcon from '../feedback-icon';

type ErrorProps = {
  imageType: IdDocImageTypes;
  errors: IdDocImageError[];
  docType: IdDocType;
  countryName: string;
};

const Error = ({ errors, imageType, docType, countryName }: ErrorProps) => {
  const { t } = useTranslation('components.error');

  const side =
    docType === IdDocType.passport && IdDocImageTypes.front
      ? 'photo page'
      : `${imageType} side`;

  const cleanedErrors =
    errors.filter(error =>
      new Set(Object.values(IdDocImageError)).has(error),
    ) ?? [];
  if (cleanedErrors.length === 0) {
    cleanedErrors.push(IdDocImageError.unknownError);
  }

  return (
    <Container>
      <NavigationHeader />
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType], color: 'error' }}
        statusIndicator={{
          component: <IcoWarning16 color="error" />,
          status: 'error',
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
