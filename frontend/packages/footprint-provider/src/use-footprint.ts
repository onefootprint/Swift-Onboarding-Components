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

  const onClose = () => {
    sendEvent('closed');
  };

  const onComplete = (footprintUserId: string) => {
    sendEvent('completed', footprintUserId);
  };

  const onUserCancel = () => {
    sendEvent('userCanceled');
  };

  useEffect(() => {
    init();
  }, []);

  return {
    isReady,
    onComplete,
    onClose,
    onUserCancel,
  };
};

export default useFootprint;
