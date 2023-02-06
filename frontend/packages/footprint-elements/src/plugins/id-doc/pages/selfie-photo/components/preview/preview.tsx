import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PreviewProps = {
  imageSrc: string;
  onRetake: () => void;
  onConfirm: () => void;
  isLoading: boolean;
};

const Preview = ({
  imageSrc,
  onRetake,
  onConfirm,
  isLoading,
}: PreviewProps) => {
  const { t } = useTranslation('pages.selfie-photo.preview');

  return (
    <Container>
      <PreviewContainer>
        <ImagePreview src={imageSrc} />
      </PreviewContainer>
      <ButtonsContainer>
        <Button
          fullWidth
          onClick={onConfirm}
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {t('confirm')}
        </Button>
        <Button
          fullWidth
          onClick={onRetake}
          variant="secondary"
          disabled={isLoading}
        >
          {t('retake')}
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    row-gap: ${theme.spacing[5]};
  `}
`;

const PreviewContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  flex-grow: 1;
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    row-gap: ${theme.spacing[5]};
  `}
`;

const ImagePreview = styled.img`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    max-height: 100%;
    width: 100%;
    transform: scaleX(-1); // Mirror images feel more natural to the user
  `}
`;

export default Preview;
