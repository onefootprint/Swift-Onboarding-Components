import { useTranslation } from '@onefootprint/hooks';
import { Checkbox, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import EncryptedCell from 'src/components/encrypted-cell';
import { IdDocDataValue } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import ImagesPreview from '../images-preview';

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

  return (
    <DataRowContainer>
      {visible ? (
        <Checkbox
          checked={disabled || checked}
          {...register}
          disabled={disabled}
          label={label}
        />
      ) : (
        <>
          <TitleContainer>
            <Typography variant="label-3" color="tertiary">
              {label}
            </Typography>
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
          </TitleContainer>
          {hasImageData && imagesVisible && (
            <ImagesContainer>
              <ImagesPreview images={data} />
            </ImagesContainer>
          )}
        </>
      )}
    </DataRowContainer>
  );
};

const DataRowContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  width: 100%;
`;

const ImagesContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
  `}
`;

export default ImageDataRow;
