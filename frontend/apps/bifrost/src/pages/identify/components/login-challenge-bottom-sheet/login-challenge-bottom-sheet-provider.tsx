import constate from 'constate';
import React from 'react';

import useLocalChallengePicker from './hooks/use-local-login-challenge-picker';
import LoginChallengeBottomSheet from './login-challenge-bottom-sheet';

export type LoginChallengeBottomSheetProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useLocalChallengePicker);

const LoginChallengeBottomSheetManager = () => {
  const { picker, hide } = useContext();

  const handleClose = (onClose?: () => void) => () => {
    hide();
    onClose?.();
  };

  return picker ? (
    <LoginChallengeBottomSheet
      open={picker.open}
      onClose={handleClose(picker.onClose)}
      identifier={picker.identifier}
    />
  ) : null;
};

const LoginChallengeBottomSheetProvider = ({
  children,
}: LoginChallengeBottomSheetProviderProps) => (
  <Provider>
    <LoginChallengeBottomSheetManager />
    {children}
  </Provider>
);

export const useLoginChallengeBottomSheet = () => {
  const picker = useContext();
  return { hide: picker.hide, show: picker.show };
};

export default LoginChallengeBottomSheetProvider;
