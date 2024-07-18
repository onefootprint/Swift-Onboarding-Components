export type CameraSide = 'front' | 'back';

const getCameraOptions = (side: CameraSide) => {
  // We ignore the deviceId for the front camera
  if (side === 'front') {
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
    },
  };
};

export default getCameraOptions;
