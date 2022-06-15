import has from 'lodash/has';
import React from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { States } from 'src/utils/state-machine';

import Canceled from './canceled';
import Init from './init';
import Register from './register';
import RegisterRetry from './register-retry';
import Success from './success';
import Unavailable from './unavailable';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  const [state] = useD2PMobileMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.init]: Init,
    [States.register]: Register,
    [States.registerRetry]: RegisterRetry,
    [States.unavailable]: Unavailable,
    [States.success]: Success,
    [States.canceled]: Canceled,
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
