const detectWebcam = async () => {
  const { mediaDevices } = navigator;
  if (!mediaDevices || !mediaDevices.enumerateDevices) return false;
  const devices = await mediaDevices.enumerateDevices();
  return devices.some(device => device.kind === 'videoinput');
};

export default detectWebcam;
