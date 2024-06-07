import { useInterval } from '@onefootprint/hooks';
import { useState } from 'react';

import { Logger } from '../../../../../../utils/logger';
import parsePermissionError from '../utils/parse-permission-error';

export type CameraPermissionState =
  | 'undetected'
  | 'undefined-navigator'
  | 'not-allowed'
  | 'allowed'
  | 'device-not-found'
  | 'device-busy'
  | 'no-video-option'
  | 'missing-media-devices'
  | 'other-error';
const PERMISSION_CHECK_INTERVAL = 100;

const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('undetected');
  const [permissionQueryPending, setPermissionQueryPending] = useState<boolean>(false);
  const shouldQueryPermission =
    (permissionState === 'undetected' || permissionState === 'not-allowed') && !permissionQueryPending;

  const handlePermissionError = (err: unknown) => {
    const error = err as DOMException;
    setPermissionState(parsePermissionError(error));
    setPermissionQueryPending(false);

    Logger.warn(`Error while retrieving camera permission. Error: ${error.name}`, { location: 'desktop-selfie' });
  };

  const promptPermission = () => {
    if (!navigator?.mediaDevices) {
      handlePermissionError({ name: 'MissingMediaDevices' });
      return;
    }
    // We call getUserMedia to prompt the user for permission
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then(stream => {
        // If there is a stream, we know that permission has been given
        stream.getTracks().forEach(track => {
          track.stop();
        });
        setPermissionState('allowed');
        setPermissionQueryPending(false);
      })
      .catch(handlePermissionError);
  };

  useInterval(
    () => {
      // We set the permission query pending to true so we don't query the permission again
      // while the previous query is still pending
      setPermissionQueryPending(true);

      // Some browsers don't support permissions or query
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        // We start by checking if the permission has already been granted
        navigator.permissions
          // @ts-expect-error: fix-me Type '"camera"' is not assignable to type 'PermissionName'.
          .query({ name: 'camera' })
          .then(result => {
            // If the permission has been granted, we don't need to do anything
            if (result.state === 'granted') {
              setPermissionState('allowed');
              return;
            }

            // If permission has not been granted, we check if the permission state is "undetected"
            // An "undetected" state means that we never queried the permission before
            // in that case, we set the permission state to "not-allowed"
            // If the permission was previously queried and set in a previous in interval, we keep the permission state as is
            // then we prompt the user for permission
            setPermissionState(prev => (prev === 'undetected' ? 'not-allowed' : prev));
            promptPermission();
          })
          .catch(() => {
            // In some browsers, navigator.permissions is not supported
            // Or there is an error while querying the permission
            // In that case, we prompt the user for permission and get the permission state from the returned stream
            // or the returned error
            promptPermission();
          });
        return;
      }

      // If navigator.permissions.query is not supported, we prompt the user for permission
      // and get the permission state from the returned stream or the returned error
      promptPermission();
    },
    shouldQueryPermission ? PERMISSION_CHECK_INTERVAL : null,
  );

  return permissionState;
};

export default useCameraPermission;
