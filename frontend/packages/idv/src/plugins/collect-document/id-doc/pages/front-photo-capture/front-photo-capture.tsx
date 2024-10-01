import { IdDocImageTypes } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import upperCase from 'lodash/upperCase';
import upperFirst from 'lodash/upperFirst';
import PhotoCapture from '../../../components/photo-capture/photo-capture';
import { ID_OUTLINE_HEIGHT_RATIO, ID_OUTLINE_WIDTH_RATIO } from '../../../constants';
import type { ReceivedImagePayload } from '../../../types';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const FrontPhotoCapture = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.front-photo-capture',
  });
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
    orgId,
    requirement,
    hasBadConnectivity,
    device,
  } = state.context;
  const { getDocName, getSideName } = useDocName({
    docType,
    imageType: IdDocImageTypes.front,
  });
  if (!docType) return null;
  const docName = getDocName();
  const docNameCapitalized = upperFirst(docName);
  const sideName = getSideName();
  const sideNameCapitalized = upperCase(sideName);

  const onComplete = (payload: ReceivedImagePayload) => send({ type: 'receivedImage', payload });

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };
  const handleCameraStuck = () => {
    send({ type: 'cameraStuck' });
  };
  const handleCameraErrored = () => {
    send({ type: 'cameraErrored' });
  };

  const cameraTitle = `${docNameCapitalized} · ${sideNameCapitalized}`;
  const previewTitle = `${docNameCapitalized}`;

  return (
    <PhotoCapture
      autocaptureKind="idDoc"
      cameraKind="back"
      deviceKind="mobile"
      sideName={sideName}
      docName={docName}
      orgId={orgId}
      requirement={requirement}
      hasBadConnectivity={hasBadConnectivity}
      outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
      title={{
        camera: cameraTitle,
        preview: previewTitle,
      }}
      subtitle={{ preview: t('subtitle.preview') }}
      onComplete={onComplete}
      onBack={handleClickBack}
      onCameraStuck={handleCameraStuck}
      onCameraErrored={handleCameraErrored}
      deviceInfo={device}
    />
  );
};

export default FrontPhotoCapture;
