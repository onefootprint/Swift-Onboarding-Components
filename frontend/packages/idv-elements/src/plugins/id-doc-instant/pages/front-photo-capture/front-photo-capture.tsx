import { useTranslation } from '@onefootprint/hooks';
import { IdDocType } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const ID_VIDEO_HEIGHT = 280;
const PASSPORT_VIDEO_HEIGHT = 450;

const ID_OUTLINE_WIDTH_RATIO = 1.1;
const ID_OUTLINE_HEIGHT_RATIO = 0.7;

const PASSPORT_OUTLINE_WIDTH_RATIO = 0.7;
const PASSPORT_OUTLINE_HEIGHT_RATIO = 0.9;

const translationIndex: { [key in IdDocType]: string } = {
  [IdDocType.driversLicense]: 'driversLicense',
  [IdDocType.idCard]: 'idCard',
  [IdDocType.passport]: 'passport',
};

const FrontPhotoCapture = () => {
  const { t } = useTranslation('pages.front-photo-capture');
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: doctType },
  } = state.context;

  if (!doctType) return null;

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
        <HeaderTitle
          title={t(`title.${translationIndex[doctType]}`)}
          subtitle={doctType !== IdDocType.passport ? t('subtitle') : undefined}
        />
      </TitleContainer>
      <PhotoCapture
        maxVideoHeight={
          doctType === IdDocType.passport
            ? PASSPORT_VIDEO_HEIGHT
            : ID_VIDEO_HEIGHT
        }
        outlineHeightRatio={
          doctType === IdDocType.passport
            ? PASSPORT_OUTLINE_HEIGHT_RATIO
            : ID_OUTLINE_HEIGHT_RATIO
        }
        outlineWidthRatio={
          doctType === IdDocType.passport
            ? PASSPORT_OUTLINE_WIDTH_RATIO
            : ID_OUTLINE_WIDTH_RATIO
        }
        cameraKind="back"
        outlineKind="full-frame"
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

export default FrontPhotoCapture;
