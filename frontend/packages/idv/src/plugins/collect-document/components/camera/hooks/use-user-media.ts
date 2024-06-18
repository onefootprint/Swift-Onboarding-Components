import { useEffect, useState } from 'react';

import { getLogger } from '../../../../../utils';
import { isUndefined } from '../../../../../utils/type-guards';
import useHandleCameraError from '../../../hooks/use-handle-camera-error';
import type { CameraKind } from '../utils/get-camera-options';
import getCameraOptions from '../utils/get-camera-options';

const { logInfo } = getLogger({
  location: 'useUserMedia',
});

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
        onCameraError(err);
        onError?.();
      }
    };

    const cleanup = () => {
      if (mediaStream) {
        logInfo('use-user-media: cleaning up media stream, stopping all tracks');
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };

    if (!mediaStream || !mediaStream.active) {
      logInfo('use-user-media: media stream not active, enabling video stream');
      cleanup();
      enableVideoStream();
    }

    return cleanup;
  }, [cameraKind, mediaStream, mediaStream?.active]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    mediaStream,
  };
};

export default useUserMedia;
