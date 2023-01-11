import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import {
  IcoSmartphone24,
  IcoSquareFrame24,
  IcoSun24,
} from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import InfoBox from '../../../../components/info-box';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import imageFileToStrippedBase64 from '../../utils/image-processing/image-file-to-stripped-base64';

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

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }
    const imageString = (await imageFileToStrippedBase64(files[0])) as string;
    onComplete(imageString);
  };

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  const handleTake = () => {
    takePhotoRef.current?.click();
  };

  return (
    <Container>
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
        <Button fullWidth onClick={handleTake}>
          {t('take-photo.title')}
        </Button>
        <StyledInput
          ref={takePhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          onChange={handleImage}
        />

        <Button fullWidth variant="secondary" onClick={handleUpload}>
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
