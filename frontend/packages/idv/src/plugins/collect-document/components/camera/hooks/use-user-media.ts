import { useEffect, useRef, useState } from 'react';

import { getLogger, isUndefined } from '@/idv/utils';
import type { CameraSide } from '../utils/get-camera-options';
import getCameraOptions from '../utils/get-camera-options';

type UseUserMediaInput = {
  side?: CameraSide;
  isLazy?: boolean;
  onError?: (err?: unknown) => void;
  onSuccess?: (stream: MediaStream) => void;
};

type UseUserMediaOutput = {
  mediaStream: MediaStream | null;
  requestMediaStream: (side: CameraSide) => Promise<void>;
};

const { logInfo } = getLogger({ location: 'useUserMedia' });

export const getMediaStream = (options: MediaStreamConstraints): Promise<MediaStream> => {
  if (isUndefined(navigator)) {
    return Promise.reject(new Error('navigator is not defined'));
  }

  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(options);
  }

  const getUserMedia = // @ts-expect-error: different versions of getUserMedia
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if (!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not supported in this browser'));
  }

  return new Promise((resolve, reject) => {
    getUserMedia.call(navigator, options, resolve, reject);
  });
};

const useUserMedia = ({ side = 'back', isLazy = false, onError, onSuccess }: UseUserMediaInput): UseUserMediaOutput => {
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);
  const isRunning = useRef<boolean>(false);

  const requestMediaStream = async (str: CameraSide) => {
    isRunning.current = true;
    try {
      const stream = await getMediaStream(getCameraOptions(str));
      stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          logInfo(`use-user-media: video track ended. track id: ${track.id}`);
        });
      });
      setMediaStream(stream);
      onSuccess?.(stream);
    } catch (err) {
      onError?.(err);
    }
  };

  useEffect(() => {
    // When lazy, don't run the effect until requestMediaStream is called
    if (isLazy && !isRunning.current) {
      return;
    }

    const cleanup = () => {
      if (mediaStream) {
        logInfo('use-user-media: cleaning up media stream, stopping all tracks');
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };

    if (!mediaStream || !mediaStream.active) {
      logInfo('use-user-media: media stream not active, enabling video stream');
      cleanup();
      requestMediaStream(side);
    }

    return cleanup;
  }, [mediaStream, mediaStream?.active, side]);

  return { mediaStream, requestMediaStream };
};

export default useUserMedia;
