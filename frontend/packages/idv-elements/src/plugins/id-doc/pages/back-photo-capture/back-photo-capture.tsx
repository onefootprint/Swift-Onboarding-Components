import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocType } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const ID_VIDEO_HEIGHT = 280;

const ID_OUTLINE_WIDTH_RATIO = 1.1;
const ID_OUTLINE_HEIGHT_RATIO = 0.7;

const translationIndex: { [key in IdDocType]: string } = {
  [IdDocType.driversLicense]: 'driversLicense',
  [IdDocType.idCard]: 'idCard',
  [IdDocType.passport]: 'passport',
};

const BackPhotoCapture = () => {
  const { t } = useTranslation('pages.back-photo-capture');
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
          subtitle={t('subtitle')}
        />
      </TitleContainer>
      <PhotoCapture
        maxVideoHeight={ID_VIDEO_HEIGHT}
        outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
        outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
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

export default BackPhotoCapture;
