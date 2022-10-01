import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PreviewProps = {
  src: string;
  onReupload: () => void;
};

const UploadPreview = ({ src, onReupload }: PreviewProps) => {
  const { t } = useTranslation('components.take-or-upload-photo.upload-photo');
  return (
    <Container>
      <ImagePreview src={src} />
      <ButtonsContainer>
        <Button onClick={onReupload} fullWidth variant="secondary">
          {t('reupload')}
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

const ImagePreview = styled.img`
  ${({ theme }) => css`
    width: 100%;
    height: auto;
    border-radius: ${theme.borderRadius[2]}px;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    justify-content: center;
    align-items: center;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]}px;
  `}
`;

export default UploadPreview;
