export type CameraKind = 'front' | 'back';

const getCameraOptions = (cameraKind: CameraKind) => {
  if (cameraKind === 'front') {
    return {
      audio: false,
      video: { facingMode: 'user' },
    };
  }

  // If the device id is undefined, the facingMode will choose default back camera
  return {
    audio: false,
    video: {
      facingMode: 'environment',
      zoom: 1,
      width: { ideal: 2560 },
      height: { ideal: 1920 },
    },
  };
};

export default getCameraOptions;
