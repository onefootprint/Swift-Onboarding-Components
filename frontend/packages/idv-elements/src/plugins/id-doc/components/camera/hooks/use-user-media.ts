import { useEffect, useState } from 'react';

import useHandleCameraError from '../../../hooks/use-handle-camera-error';
import getCameraOptions, { CameraKind } from '../utils/get-camera-options';

const useUserMedia = (cameraKind: CameraKind, onError?: () => void) => {
  const onCameraError = useHandleCameraError();
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);

  useEffect(() => {
    const enableVideoStream = async () => {
      const cameraOptions = await getCameraOptions(cameraKind);
      try {
        const stream = await navigator.mediaDevices.getUserMedia(cameraOptions);
        setMediaStream(stream);
      } catch (err) {
        onCameraError(err);
        onError?.();
      }
    };

    const cleanup = () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };

    if (!mediaStream) {
      enableVideoStream();
    }
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStream, cameraKind]);

  return mediaStream;
};

export default useUserMedia;
