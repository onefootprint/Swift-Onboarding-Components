import { useTranslation } from '@onefootprint/hooks';
import { DecryptedIdDocStatus } from '@onefootprint/types';
import { Checkbox, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import EncryptedCell from 'src/components/encrypted-cell';
import { IdDocDataValue } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import DecryptedDataPreview from '../decrypted-data-preview';
import SuccessFlag from '../success-flag';

export type ImageDataRowProps = {
  label: string;
  data?: IdDocDataValue;
  checkbox: {
    disabled: boolean;
    checked: boolean;
    visible: boolean;
    register: UseFormRegisterReturn;
  };
};

const ImageDataRow = ({ label, data, checkbox }: ImageDataRowProps) => {
  const { t } = useTranslation(
    'pages.user-details.user-info.id-doc.id-doc-images',
  );
  const { disabled, checked, visible, register } = checkbox;
  const [imagesVisible, setImagesVisible] = useState(false);
  const hasImageData = !!data;
  const handleToggleIdDocVisibility = () => {
    setImagesVisible(!imagesVisible);
  };
  const isSuccessful = data?.some(
    doc => doc.status === DecryptedIdDocStatus.success,
  );

  if (visible) {
    return (
      <Container>
        <TitleContainer>
          <Checkbox
            checked={disabled || checked}
            {...register}
            disabled={disabled}
            label={label}
          />
          {isSuccessful && <SuccessFlag />}
        </TitleContainer>
      </Container>
    );
  }

  return (
    <Container>
      <RowContainer>
        <TitleContainer>
          <Typography variant="label-3" color="tertiary">
            {label}
          </Typography>
          {isSuccessful && <SuccessFlag />}
        </TitleContainer>
        {data === null && <EncryptedCell />}
        {data === undefined && (
          <Typography
            variant="body-3"
            color="primary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            -
          </Typography>
        )}
        {hasImageData && (
          <LinkButton onClick={handleToggleIdDocVisibility} size="compact">
            {imagesVisible ? t('hide') : t('show')}
          </LinkButton>
        )}
      </RowContainer>
      {hasImageData && imagesVisible && <DecryptedDataPreview images={data} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  width: 100%;
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column wrap;
    justify-content: flex-start;
    gap: ${theme.spacing[7]};
  `}
`;

export default ImageDataRow;
