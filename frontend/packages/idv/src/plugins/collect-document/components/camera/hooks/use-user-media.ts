import { useEffect, useRef, useState } from 'react';

import { getLogger } from '../../../../../utils';
import { isUndefined } from '../../../../../utils/type-guards';
import useHandleCameraError from '../../../hooks/use-handle-camera-error';
import type { CameraKind } from '../utils/get-camera-options';
import getCameraOptions from '../utils/get-camera-options';

const { logInfo, logWarn } = getLogger({
  location: 'useUserMedia',
});

const useUserMedia = (cameraKind: CameraKind, onError?: () => void) => {
  const onCameraError = useHandleCameraError();
  const [mediaStream, setMediaStream] = useState<null | MediaStream>(null);
  const [switchCameraCount, setSwitchCameraCount] = useState(0);
  const deviceIds = useRef<
    {
      id: string;
      used: boolean;
    }[]
  >([]);

  useEffect(() => {
    const populateDeviceIds = async (deviceId?: string) => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        const desiredFacingMode = cameraKind === 'front' ? 'user' : 'environment';
        const desiredDevices = videoInputDevices.filter(device =>
          (device as InputDeviceInfo).getCapabilities().facingMode?.includes(desiredFacingMode),
        );
        deviceIds.current = desiredDevices.map(device => ({
          id: device.deviceId,
          used: device.deviceId === deviceId,
        }));
        logInfo(`Populated device ids: ${deviceIds.current.map(device => device.id).join(', ')}`);
      } catch (e) {
        logWarn('Error while populating device ids', e);
      }
    };

    const initStreamAndPopulateDeviceIds = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(getCameraOptions(cameraKind));
        const { deviceId } = stream.getVideoTracks()[0].getSettings();
        await populateDeviceIds(deviceId);
        setMediaStream(stream);
        logInfo(`Initialized stream with deviceId: ${deviceId}`);
      } catch (err) {
        onCameraError(err);
        onError?.();
      }
    };

    const switchCamera = async () => {
      if (deviceIds.current.length === 0) return;
      const deviceId = deviceIds.current.find(device => !device.used)?.id;
      if (!deviceId) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia(getCameraOptions(cameraKind, deviceId));
        deviceIds.current.forEach(device => {
          // eslint-disable-next-line no-param-reassign
          if (device.id === deviceId) device.used = true;
        });
        logInfo(`Switched to camera with deviceId: ${deviceId}`);
        setMediaStream(stream);
      } catch (err) {
        onCameraError(err);
        onError?.();
      }
    };

    const enableVideoStream = async () => {
      if (isUndefined(navigator)) return;
      try {
        if (deviceIds.current.length === 0) {
          logInfo('use-user-media: no device ids found, populating device ids and initializing stream');
          await initStreamAndPopulateDeviceIds();
        } else {
          logInfo(`use-user-media: device ids found, switching camera, switchCameraCount: ${switchCameraCount}`);
          await switchCamera();
        }
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
  }, [cameraKind, mediaStream, switchCameraCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchCamera = () => {
    logInfo('use-user-media: switch camera called from autocapture hook');
    // If all cameras have been used, don't switch anymore
    if (deviceIds.current.length - 1 > switchCameraCount) setSwitchCameraCount(prevCount => prevCount + 1);
    else logWarn('All cameras have been used, cannot switch anymore');
  };

  return {
    mediaStream,
    switchCamera,
  };
};

export default useUserMedia;
