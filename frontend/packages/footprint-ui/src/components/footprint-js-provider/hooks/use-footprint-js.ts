import Postmate from 'postmate';
import { useEffect, useState } from 'react';

const useFootprintJs = () => {
  const [postmate, setPostmate] = useState<Postmate.ChildAPI>();
  const isReady = !!postmate;

  const init = async () => {
    const localPostmate = await new Postmate.Model({});
    setPostmate(localPostmate);
  };

  const sendEvent = (eventName: string, data?: any) => {
    if (postmate) {
      postmate.emit(eventName, data);
    } else {
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  };

  const close = () => {
    sendEvent('closed');
  };

  const complete = (token: string) => {
    sendEvent('completed', token);
  };

  const cancel = () => {
    sendEvent('userCanceled');
  };

  useEffect(() => {
    init();
  }, []);

  return {
    isReady,
    close,
    complete,
    cancel,
  };
};

export default useFootprintJs;
