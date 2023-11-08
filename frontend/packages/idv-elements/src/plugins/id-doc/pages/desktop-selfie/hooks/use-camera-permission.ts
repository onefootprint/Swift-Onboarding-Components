import { useState } from 'react';
import { useEffectOnce, useInterval } from 'usehooks-ts';

import Logger from '../../../../../utils/logger';
import parsePermissionError from '../utils/parse-permission-error';

export type CameraPermissionState =
  | 'undetected'
  | 'undefined-navigator'
  | 'not-allowed'
  | 'allowed'
  | 'device-not-found'
  | 'device-busy'
  | 'no-video-option'
  | 'other-error';
const PERMISSION_CHECK_INTERVAL = 100;

const useCameraPermission = () => {
  const [permissionState, setPermissionState] =
    useState<CameraPermissionState>('undetected');

  // We prompt for permission here
  useEffectOnce(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
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
        setPermissionState(parsePermissionError(err));

        Logger.warn(
          `Error while retrieving camera permission. Error: ${error.name}`,
          'desktop-selfie',
        );
      });
  });

  useInterval(
    () => {
      // Some browsers don't support permissions or query
      if (
        navigator.permissions &&
        typeof navigator.permissions.query === 'function'
      ) {
        navigator.permissions
          // @ts-expect-error: fix-me Type '"camera"' is not assignable to type 'PermissionName'.
          .query({ name: 'camera' })
          .then(result => {
            if (result.state === 'granted') {
              setPermissionState('allowed');
            } else {
              setPermissionState(prev =>
                prev === 'undetected' ? 'not-allowed' : prev,
              );
            }
          })
          .catch(() => {
            // Technically the permission can still not be allowed;
            // but the only way we can have an error is if the browser doesn't support this API (e.g. firefox)
            // In that case we will let camera component handle the rest
            setPermissionState('allowed');
          });
      } else {
        setPermissionState('allowed');
      }
    },
    permissionState !== 'allowed' ? PERMISSION_CHECK_INTERVAL : null,
  );

  return permissionState;
};

export default useCameraPermission;
