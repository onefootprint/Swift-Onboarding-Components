import { useTranslation } from '@onefootprint/hooks';
import { VaultIdDoc } from '@onefootprint/types';
import {
  Box,
  Checkbox,
  LinkButton,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import EncryptedCell from 'src/components/encrypted-cell';
import styled, { css } from 'styled-components';

import DecryptedDataPreview from '../decrypted-data-preview';
import SuccessFlag from '../success-flag';

export type ImageDataRowProps = {
  hasPermission: boolean;
  canAccess: boolean;
  canSelect: boolean;
  hasValue: boolean;
  isDataDecrypted: boolean;
  isSuccessful?: boolean;
  label: string;
  name: string;
  showCheckbox: boolean;
  value?: VaultIdDoc;
};

const ImageDataRow = ({
  hasPermission,
  canAccess,
  canSelect,
  hasValue,
  isDataDecrypted,
  isSuccessful,
  label,
  name,
  showCheckbox,
  value,
}: ImageDataRowProps) => {
  const { t } = useTranslation('pages.user-details.user-info.id-doc');
  const { register } = useFormContext();
  const [imagesVisible, setImagesVisible] = useState(false);
  const disabled = !canSelect;
  const showTooltip = disabled;

  const handleToggleIdDocVisibility = () => {
    setImagesVisible(!imagesVisible);
  };

  const getTooltip = () => {
    if (!hasPermission || !canAccess) {
      return t('not-allowed');
    }
    if (!hasValue) {
      return t('empty');
    }
    return undefined;
  };

  if (showCheckbox) {
    return (
      <Container role="row" aria-label={label}>
        <RowContainer>
          <TitleContainer>
            <Tooltip disabled={!showTooltip} text={getTooltip()}>
              <Box>
                <Checkbox
                  checked={isDataDecrypted || undefined}
                  {...register(name)}
                  disabled={disabled}
                  label={label}
                />
              </Box>
            </Tooltip>
            {isSuccessful && <SuccessFlag />}
          </TitleContainer>
          <Box>{isDataDecrypted ? null : <EncryptedCell />}</Box>
        </RowContainer>
      </Container>
    );
  }

  return (
    <Container role="row" aria-label={label}>
      <RowContainer>
        <TitleContainer>
          <Typography variant="body-3" color="tertiary">
            {label}
          </Typography>
          {isSuccessful && <SuccessFlag />}
        </TitleContainer>
        {isDataDecrypted ? (
          <LinkButton onClick={handleToggleIdDocVisibility} size="compact">
            {imagesVisible ? t('id-doc-images.hide') : t('id-doc-images.show')}
          </LinkButton>
        ) : (
          <EncryptedCell />
        )}
      </RowContainer>
      {isDataDecrypted && imagesVisible && value && (
        <DecryptedDataPreview images={value} />
      )}
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
