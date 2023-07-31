export type CameraKind = 'front' | 'back';

const getCameraOptions = async (cameraKind: CameraKind) => {
  if (cameraKind === 'front') {
    return {
      audio: false,
      video: { facingMode: 'user' },
    };
  }

  let deviceId;
  const devices = await navigator.mediaDevices.enumerateDevices();

  // We iterate over the devices
  // if we find a device with "Back Ultra Wide" in label, we use it as our device (camera)
  // Newer iOS phones after iOS 16.3 has this camera
  // Other cameras on those iOS devices cause shifting and blur issues
  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    if (device.label.includes('Back Ultra Wide')) {
      deviceId = device.deviceId;
      break;
    }
  }

  // If the device id is undefined, the facingMode will choose default back camera
  return {
    audio: false,
    video: {
      deviceId,
      facingMode: 'environment',
      zoom: 1,
      width: { ideal: 2560 },
      height: { ideal: 1920 },
    },
  };
};

export default getCameraOptions;
