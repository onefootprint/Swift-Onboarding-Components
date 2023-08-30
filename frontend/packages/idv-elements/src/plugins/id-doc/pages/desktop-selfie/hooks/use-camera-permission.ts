import { useState } from 'react';
import { useEffectOnce, useInterval } from 'usehooks-ts';

export type CameraPermissionState = 'undetected' | 'notAllowed' | 'allowed';
const PERMISSION_CHECK_INTERVAL = 100;

const useCameraPermission = () => {
  const [permissionState, setPermissionState] =
    useState<CameraPermissionState>('undetected');

  // We prompt for permission here
  useEffectOnce(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then(stream => {
        // If there is a stream, we know that permission has been given
        setPermissionState('allowed');
        stream.getTracks().forEach(track => {
          track.stop();
        });
      })
      .catch(err => {
        const error = err as DOMException;
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        )
          setPermissionState('notAllowed');
      });
  });

  useInterval(
    () => {
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: 'camera' as any })
          .then(result => {
            if (result.state === 'granted') {
              setPermissionState('allowed');
            } else {
              setPermissionState('notAllowed');
            }
          })
          .catch(() => {
            // Technically the permission can still not be allowed;
            // but the only way we can have an error is if the browser doesn't support this API (e.g. firefox)
            // In that case we will let camera component handle the rest
            setPermissionState('allowed');
          });
      }
    },
    permissionState !== 'allowed' ? PERMISSION_CHECK_INTERVAL : null,
  );

  return permissionState;
};

export default useCameraPermission;
