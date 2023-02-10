import { useState } from 'react';

import { LoginChallengePickerProps } from '../login-challenge-picker';

const useLocalLoginChallengePicker = () => {
  const [picker, setPicker] = useState<LoginChallengePickerProps | undefined>();

  const show = (props: Omit<LoginChallengePickerProps, 'open'>) => {
    setPicker({ ...props, open: true });
  };

  const hide = () => {
    if (!picker) {
      return;
    }
    setPicker(currentPicker => {
      if (!currentPicker) {
        return undefined;
      }
      return {
        ...currentPicker,
        open: false,
      };
    });
  };

  return { picker, show, hide };
};

export default useLocalLoginChallengePicker;
