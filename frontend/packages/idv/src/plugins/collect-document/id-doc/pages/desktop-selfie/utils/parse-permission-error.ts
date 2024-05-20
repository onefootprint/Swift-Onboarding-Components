import type { CameraPermissionState } from '../hooks/use-camera-permission';

const parsePermissionError = (error: DOMException): CameraPermissionState => {
  if (error instanceof TypeError) {
    return 'undefined-navigator';
  }
  if (
    error.name === 'NotAllowedError' ||
    error.name === 'PermissionDeniedError'
  ) {
    return 'not-allowed';
  }
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'device-not-found';
  }
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'device-busy';
  }
  if (error.name === 'MissingMediaDevices') {
    return 'missing-media-devices';
  }
  if (
    error.name === 'OverconstrainedError' ||
    error.name === 'ConstraintNotSatisfiedError'
  ) {
    return 'no-video-option';
  }
  return 'other-error';
};

export default parsePermissionError;
