// TODO: Implement the mutation to send the deviceSessionId to the backend
// https://linear.app/footprint/issue/FP-2197/send-device-session-id-to-the-backend
const useSendDeviceId = () => {
  const mutate = (deviceSessionId: string) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          result: 'success',
          deviceSessionId,
        });
      }, 1000);
    });

  return { mutate };
};

export default useSendDeviceId;
