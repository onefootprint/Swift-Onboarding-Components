import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../../hooks/ui/use-log-state-machine';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import ConfirmContinueOnDesktop from '../confirm-continue-on-desktop';
import Processing from '../processing';
import QRRegister from '../qr-register';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useDesktopMachine();
  const isDone = state.matches('complete');
  useLogStateMachine('transfer-desktop', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('qrRegister') && <QRRegister />}
      {state.matches('confirmContinueOnDesktop') && (
        <ConfirmContinueOnDesktop />
      )}
      {state.matches('processing') && <Processing />}
    </>
  );
};

export default Router;
