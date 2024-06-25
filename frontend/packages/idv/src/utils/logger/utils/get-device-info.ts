export const getDeviceNetwork = () => {
  const conn = // @ts-expect-error: browser support
    typeof navigator !== 'undefined' && typeof navigator.connection !== 'undefined' ? navigator.connection : undefined;

  return conn
    ? {
        deviceConnectionDownlink: String(conn.downlink),
        deviceConnectionEffectiveType: String(conn.effectiveType),
        deviceConnectionsaveData: String(conn.saveData),
      }
    : undefined;
};

export const getDeviceMemory = () =>
  // @ts-expect-error: browser support
  typeof navigator !== 'undefined' && typeof navigator.deviceMemory === 'number' // @ts-expect-error: browser support
    ? { deviceMemory: navigator.deviceMemory }
    : undefined;
