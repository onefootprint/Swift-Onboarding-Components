import React from 'react';
import FlashMessage, { hideMessage, showMessage } from 'react-native-flash-message';

import Notification from './components/notification';
import type { MessageComponentProps, ShowToast } from './toast.types';

const DURATION = 5000;

export const ToastProvider = () => (
  <FlashMessage
    position="top"
    autoHide={true}
    duration={DURATION}
    MessageComponent={({ message }: MessageComponentProps) => (
      <Notification
        cta={message.cta}
        description={message.description}
        onClose={hideMessage}
        title={message.message}
        variant={message.variant}
      />
    )}
  />
);

export const useToast = () => {
  const show = ({ description, title, variant, cta }: ShowToast) => {
    // @ts-ignore
    return showMessage({ description, message: title, cta, variant });
  };

  const hide = hideMessage;

  return { show, hide };
};
