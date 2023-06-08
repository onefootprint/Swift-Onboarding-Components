import { useEffect, useState } from 'react';

import useHandleCameraError from '../../../hooks/use-handle-camera-error';

const useUserMedia = (
  requestedMedia: MediaStreamConstraints,
  onError?: () => void,
) => {
  const onCameraError = useHandleCameraError();
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);

  useEffect(() => {
    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          requestedMedia,
        );
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
  }, [mediaStream, requestedMedia]);

  return mediaStream;
};

export default useUserMedia;
