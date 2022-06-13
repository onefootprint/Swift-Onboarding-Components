import { useEffect, useState } from 'react';
import UAParser from 'ua-parser-js';

const DEFAULT_DEVICE_TYPE = 'unknown';

const uaParser = new UAParser();

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(DEFAULT_DEVICE_TYPE);
  const { type } = uaParser.getDevice();
  useEffect(() => {
    if (type) {
      setDeviceType(type);
    }
  }, [type]);
  return deviceType;
};

export default useDeviceType;
