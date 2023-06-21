import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const MAX_VIDEO_HEIGHT = 390;
const FACE_OUTLINE_TO_HEIGHT_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('pages.selfie-photo');
  const [, send] = useIdDocMachine();

  const onComplete = (imageString: string) =>
    send({
      type: 'receivedImage',
      payload: {
        image: imageString,
      },
    });

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrev',
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onBack: handleClickBack }} />
      <TitleContainer>
        <HeaderTitle title={t('title')} />
      </TitleContainer>
      <PhotoCapture
        maxVideoHeight={MAX_VIDEO_HEIGHT}
        outlineHeightRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
        outlineWidthRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
        cameraKind="front"
        outlineKind="corner"
        onComplete={onComplete}
      />
    </>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[5]});
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default SelfiePhoto;
