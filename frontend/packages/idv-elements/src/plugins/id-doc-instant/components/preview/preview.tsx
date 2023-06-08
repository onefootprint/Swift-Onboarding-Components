import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';

type PreviewProps = {
  imageSrc: string;
  onRetake: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  subtitle?: string;
};

const Preview = ({
  imageSrc,
  onRetake,
  onConfirm,
  isLoading,
  title,
  subtitle,
}: PreviewProps) => {
  const { t } = useTranslation('components.preview');

  return (
    <Container>
      <HeaderTitle title={title} subtitle={subtitle} />
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
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    flex-grow: 1;
    margin-bottom: ${theme.spacing[8]};
  `}
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
    border-radius: ${theme.borderRadius.large};
    width: 100%;
    transform: scaleX(-1); // Mirror images feel more natural to the user
  `}
`;

export default Preview;
