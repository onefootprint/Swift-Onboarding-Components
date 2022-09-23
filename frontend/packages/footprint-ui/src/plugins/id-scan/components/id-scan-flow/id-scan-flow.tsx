import React, { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { IdScanProps } from '../../id-scan.types';
import { Events, States } from '../../utils/state-machine/types';
import { useIdScanMachine } from '../machine-provider';
import IdCountryAndTypeSelection from './pages/country-and-type-selection';

type IdScanFlowProps = Pick<IdScanProps, 'context' | 'onDone'>;

const IdScanFlow = ({ context, onDone }: IdScanFlowProps) => {
  const [state, send] = useIdScanMachine();

  // Inject the context and customMetadata into the state machine
  useEffectOnce(() => {
    send({
      type: Events.receivedContext,
      payload: {
        authToken: context.authToken,
        device: context.device,
      },
    });
  });

  useEffect(() => {
    if (state.done) {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  if (state.matches(States.idCountryAndTypeSelection)) {
    return <IdCountryAndTypeSelection />;
  }

  return null;
};
export default IdScanFlow;
