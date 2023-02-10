import constate from 'constate';
import React from 'react';

import useLocalChallengePicker from './hooks/use-local-login-challenge-picker';
import LoginChallengePicker from './login-challenge-picker';

export type LoginChallengePickerProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useLocalChallengePicker);

const LoginChallengePickerManager = () => {
  const { picker, hide } = useContext();

  const handleClose = (onClose?: () => void) => () => {
    hide();
    onClose?.();
  };

  return picker ? (
    <LoginChallengePicker
      open={picker.open}
      onClose={handleClose(picker.onClose)}
      identifier={picker.identifier}
    />
  ) : null;
};

const LoginChallengePickerProvider = ({
  children,
}: LoginChallengePickerProviderProps) => (
  <Provider>
    <LoginChallengePickerManager />
    {children}
  </Provider>
);

export const useLoginChallengePicker = () => {
  const picker = useContext();
  return { hide: picker.hide, show: picker.show };
};

export default LoginChallengePickerProvider;
