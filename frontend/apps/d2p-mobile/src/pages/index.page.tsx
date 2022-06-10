import has from 'lodash/has';
import React from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { States } from 'src/utils/state-machine';

import BiometricCanceled from './biometric-canceled';
import BiometricRegister from './biometric-register';
import BiometricRegisterRetry from './biometric-register-retry';
import BiometricSuccess from './biometric-success';
import BiometricUnavailable from './biometric-unavailable';
import Init from './init';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  const [state] = useD2PMobileMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.init]: Init,
    [States.biometricRegister]: BiometricRegister,
    [States.biometricRegisterRetry]: BiometricRegisterRetry,
    [States.biometricUnavailable]: BiometricUnavailable,
    [States.biometricSuccess]: BiometricSuccess,
    [States.biometricCanceled]: BiometricCanceled,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
