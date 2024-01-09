import { useEffect, useState } from 'react';

import Logger from '../../../../../utils/logger';
import useHandleCameraError from '../../../hooks/use-handle-camera-error';
import type { CameraKind } from '../utils/get-camera-options';
import getCameraOptions from '../utils/get-camera-options';

const isUndefined = (x: unknown): x is 'undefined' => typeof x === 'undefined';
const logError = (e: string) => Logger.error(e, 'camera');

const useUserMedia = (cameraKind: CameraKind, onError?: () => void) => {
  const onCameraError = useHandleCameraError();
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);

  useEffect(() => {
    const enableVideoStream = async () => {
      if (isUndefined(navigator)) return;

      const cameraOptions = getCameraOptions(cameraKind);
      try {
        const stream = await navigator.mediaDevices.getUserMedia(cameraOptions);
        setMediaStream(stream);
      } catch (err) {
        logError(`Could not initialize media stream. Error: ${err}`);
        onCameraError(err);
        onError?.();
      }
    };

    const cleanup = () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };

    if (!mediaStream || !mediaStream.active) {
      cleanup();
      enableVideoStream();
    }

    return cleanup;
  }, [cameraKind, mediaStream, mediaStream?.active]); // eslint-disable-line react-hooks/exhaustive-deps

  return mediaStream;
};

export default useUserMedia;
