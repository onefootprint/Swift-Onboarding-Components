import { useTranslation } from 'react-i18next';

import PhotoCapture from '../../../components/photo-capture/photo-capture';
import type { CaptureKind } from '../../../types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import DesktopCameraPermission from './desktop-camera-permission';
import useCameraPermission from './hooks/use-camera-permission';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.7;

const DesktopSelfie = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.desktop-selfie',
  });
  const [state, send] = useIdDocMachine();
  const { orgId, requirement, hasBadConnectivity } = state.context;
  const permissionState = useCameraPermission();

  const onComplete = (imageFile: File | Blob, extraCompressed: boolean, captureKind: CaptureKind) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });

  return permissionState === 'allowed' ? (
    <PhotoCapture
      autocaptureKind="face"
      cameraKind="front"
      deviceKind="desktop"
      orgId={orgId}
      requirement={requirement}
      hasBadConnectivity={hasBadConnectivity}
      outlineHeightRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      outlineWidthRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      title={{
        camera: t('header.title.camera'),
        preview: t('header.title.preview'),
      }}
      subtitle={{ camera: t('header.subtitle.camera') }}
      onComplete={onComplete}
    />
  ) : (
    <DesktopCameraPermission permissionState={permissionState} />
  );
};

export default DesktopSelfie;
