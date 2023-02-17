import { useState } from 'react';

import { LoginChallengeBottomSheetProps } from '../login-challenge-bottom-sheet';

const useLocalLoginChallengeBottomSheet = () => {
  const [picker, setPicker] = useState<
    LoginChallengeBottomSheetProps | undefined
  >();

  const show = (props: Omit<LoginChallengeBottomSheetProps, 'open'>) => {
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

export default useLocalLoginChallengeBottomSheet;
