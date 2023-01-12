import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { IdDocDataValue } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import ImagesPreview from '../images-preview';

export type ImageDataRowProps = {
  title: string;
  data?: IdDocDataValue;
  imagesVisible?: boolean;
  onToggleImageVisibility: () => void;
};

const ImageDataRow = ({
  title,
  data,
  imagesVisible,
  onToggleImageVisibility,
}: ImageDataRowProps) => {
  const { t } = useTranslation(
    'pages.user-details.user-info.id-doc.id-doc-images',
  );
  const hasImageData = !!data;

  return (
    <DataRowContainer>
      <TitleContainer>
        <Typography variant="label-3" color="tertiary">
          {title}
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
          <LinkButton onClick={onToggleImageVisibility} size="compact">
            {imagesVisible ? t('hide') : t('show')}
          </LinkButton>
        )}
      </TitleContainer>
      {hasImageData && imagesVisible && (
        <ImagesContainer>
          <ImagesPreview images={data} />
        </ImagesContainer>
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
