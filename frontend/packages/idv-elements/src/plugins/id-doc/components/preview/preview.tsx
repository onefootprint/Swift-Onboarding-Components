import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, media } from '@onefootprint/ui';
import React from 'react';

import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import type { DeviceKind } from '../camera/types';
import type { CameraKind } from '../camera/utils/get-camera-options';

type PreviewProps = {
  imageSrc: string;
  onRetake: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  cameraKind: CameraKind;
  deviceKind: DeviceKind;
};

const Preview = ({
  imageSrc,
  onRetake,
  onConfirm,
  isLoading,
  cameraKind,
  deviceKind,
}: PreviewProps) => {
  const { t } = useTranslation('components.id-doc.preview');

  return (
    <Container>
      <PreviewContainer data-device-kind={deviceKind}>
        <ImagePreview
          data-private
          src={imageSrc}
          data-camera-kind={cameraKind}
          data-device-kind={deviceKind}
        />
      </PreviewContainer>
      <StickyBottomBox>
        <ButtonsContainer data-device-kind={deviceKind}>
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
      </StickyBottomBox>
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

    margin-bottom: calc(-1 * ${theme.spacing[8]});

    ${media.lessThan('md')`
      padding: 0 ${theme.spacing[3]}; 
    `}
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

    &[data-device-kind='mobile'] {
      row-gap: ${theme.spacing[5]};
    }

    &[data-device-kind='desktop'] {
      row-gap: ${theme.spacing[3]};
    }
  `}
`;

const ImagePreview = styled.img`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    width: 100%;

    &[data-device-kind='mobile'] {
      border-radius: ${theme.borderRadius.large};
    }

    &[data-camera-kind='front'] {
      transform: scaleX(
        -1
      ); // Mirror the image only if we are used the front camera to take the picture
    }
  `}
`;

export default Preview;
