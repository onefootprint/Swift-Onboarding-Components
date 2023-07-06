import { useTranslation } from '@onefootprint/hooks';
import { IdDocType } from '@onefootprint/types';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const ID_OUTLINE_WIDTH_RATIO = 0.9;
const ID_OUTLINE_HEIGHT_RATIO = 0.56;

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
      <NavigationHeader
        button={{ variant: 'back', onBack: handleClickBack }}
        content={{
          kind: 'static',
          title: t(`title.${translationIndex[doctType]}`),
        }}
      />
      <PhotoCapture
        outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
        outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
        cameraKind="back"
        outlineKind="full-frame"
        onComplete={onComplete}
        autocaptureKind="document"
      />
    </>
  );
};

export default FrontPhotoCapture;
