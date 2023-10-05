import React from 'react';

import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import type { CaptureKind } from '../../utils/state-machine';
import DesktopCameraPermission from './desktop-camera-permission';
import useCameraPermission from './hooks/use-camera-permission';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.8;

const DesktopSelfie = () => {
  const [, send] = useIdDocMachine();
  const permissionState = useCameraPermission();

  const onComplete = (imageFile: File, captureKind?: CaptureKind) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        captureKind,
      },
    });

  return permissionState === 'allowed' ? (
    <PhotoCapture
      outlineHeightRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      outlineWidthRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      cameraKind="front"
      outlineKind="corner"
      onComplete={onComplete}
      autocaptureKind="face"
      deviceKind="desktop"
    />
  ) : (
    <DesktopCameraPermission permissionState={permissionState} />
  );
};

export default DesktopSelfie;
