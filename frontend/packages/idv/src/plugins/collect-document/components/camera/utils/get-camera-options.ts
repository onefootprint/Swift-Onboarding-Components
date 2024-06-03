export type CameraKind = 'front' | 'back';

const getCameraOptions = (cameraKind: CameraKind, deviceId?: string) => {
  // We ignore the deviceId for the front camera
  if (cameraKind === 'front') {
    return {
      audio: false,
      video: { facingMode: 'user' },
    };
  }

  return {
    audio: false,
    video: {
      facingMode: 'environment',
      zoom: 1,
      width: { ideal: 2560 },
      height: { ideal: 1920 },
      deviceId,
    },
  };
};

export default getCameraOptions;
