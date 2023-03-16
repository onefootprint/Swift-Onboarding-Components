import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import {
  IcoSmartphone24,
  IcoSquareFrame24,
  IcoSun24,
} from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import IdAnimation from '../../../../components/animations/id-animation';
import InfoBox from '../../../../components/info-box';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import useHandleCameraError from '../../hooks/use-handle-camera-error';
import useProcessImage from '../../hooks/use-process-image/use-process-image';

type IdDocPhotoPromptProps = {
  showGuidelines?: boolean;
  type: IdDocType;
  iconComponent: Icon;
  side: 'front' | 'back';
  onComplete: (image: string) => void;
};

const IdDocPhotoPrompt = ({
  showGuidelines,
  onComplete,
  iconComponent: Icon,
  type,
  side,
}: IdDocPhotoPromptProps) => {
  const { t } = useTranslation('components.id-doc-photo-prompt');
  const takePhotoRef = useRef<HTMLInputElement | undefined>();
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const onCameraError = useHandleCameraError();
  const { processImageFile, convertImageFileToStrippedBase64 } =
    useProcessImage();

  const [isLoading, setIsLoading] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<
    'take' | 'upload' | undefined
  >();

  const onProcessingDone = () => {
    setIsLoading(false);
    setCaptureMethod(undefined);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const { files } = event.target;
    if (!files?.length) {
      onProcessingDone();
      return;
    }

    const processedImageFile = await processImageFile(files[0]);
    if (!processedImageFile) {
      onProcessingDone();
      return;
    }

    const imageString = await convertImageFileToStrippedBase64(
      processedImageFile,
    );
    if (!imageString) {
      onProcessingDone();
      return;
    }

    onComplete(imageString);
    onProcessingDone();
  };

  const handleUpload = () => {
    setCaptureMethod('upload');
    uploadPhotoRef.current?.click();
  };

  const handleTake = () => {
    setCaptureMethod('take');
    try {
      takePhotoRef.current?.click();
    } catch (err) {
      onCameraError(err);
      onProcessingDone();
    }
  };

  return (
    <Container>
      {side === 'back' && (
        <IdAnimation
          firstText={t('animation-back-side.first')}
          secondText={t('animation-back-side.second')}
          src="/id-animation/id-animation.riv"
        />
      )}
      <Icon />
      <HeaderTitle
        title={t('title', {
          type: IdDocTypeToLabel[type],
          side: side.toUpperCase(),
        })}
        subtitle={t('subtitle', { type: IdDocTypeToLabel[type], side })}
      />
      {showGuidelines && (
        <InfoBox
          items={[
            {
              title: t('guidelines.check-lighting.title'),
              description: t('guidelines.check-lighting.description'),
              Icon: IcoSun24,
            },
            {
              title: t('guidelines.device-steady.title'),
              description: t('guidelines.device-steady.description'),
              Icon: IcoSmartphone24,
            },
            {
              title: t('guidelines.whole-document.title'),
              description: t('guidelines.whole-document.description'),
              Icon: IcoSquareFrame24,
            },
          ]}
        />
      )}
      <ButtonsContainer>
        <Button
          fullWidth
          onClick={handleTake}
          loading={isLoading && captureMethod === 'take'}
          disabled={isLoading}
        >
          {t('take-photo.title')}
        </Button>
        <StyledInput
          ref={takePhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          onChange={handleImage}
        />
        <Button
          fullWidth
          variant="secondary"
          onClick={handleUpload}
          loading={isLoading && captureMethod === 'upload'}
          disabled={isLoading}
        >
          {t('upload-photo.title')}
        </Button>
        <StyledInput
          ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleImage}
        />
      </ButtonsContainer>
    </Container>
  );
};

const StyledInput = styled.input`
  display: none;
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    > button {
      margin-top: -${theme.spacing[4]};
    }
  `}
`;

export default IdDocPhotoPrompt;
