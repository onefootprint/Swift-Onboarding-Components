import { useEffect, useState } from 'react';

const useUserMedia = (
  requestedMedia: MediaStreamConstraints,
  onError?: () => void,
) => {
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);

  useEffect(() => {
    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          requestedMedia,
        );
        setMediaStream(stream);
      } catch (err) {
        // https://linear.app/footprint/issue/FP-1444/handle-different-usermedia-errors-beyond-missing-permissions
        // TODO: handle different errors
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
