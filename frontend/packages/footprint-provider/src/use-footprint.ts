import Postmate from 'postmate';
import { useEffect, useState } from 'react';

const useFootprint = () => {
  const [postmate, setPostmate] = useState<Postmate.ChildAPI>();
  const isReady = !!postmate;

  const init = async () => {
    const localPostmate = await new Postmate.Model({});
    setPostmate(localPostmate);
  };

  const sendEvent = (eventName: string, data?: any) => {
    if (!postmate) {
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
      return;
    }
    postmate.emit(eventName, data);
  };

  const closed = () => {
    sendEvent('closed');
  };

  const onCompleted = (footprintUserId: string) => {
    sendEvent('completed', { footprintUserId });
  };

  useEffect(() => {
    init();
  }, []);

  return {
    isReady,
    onCompleted,
    closed,
  };
};

export default useFootprint;
