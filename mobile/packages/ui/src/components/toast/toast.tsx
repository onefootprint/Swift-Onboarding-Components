import React from 'react';
import FlashMessage, {
  hideMessage,
  showMessage,
} from 'react-native-flash-message';

import haptic from '../../utils/haptic';
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
    if (variant === 'error') {
      haptic.error();
    } else {
      haptic.impact();
    }
    return showMessage({ description, message: title, cta, variant } as any);
  };

  const hide = hideMessage;

  return { show, hide };
};
