import React, { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { IdScanProps } from '../../id-scan.types';
import { Events, States } from '../../utils/state-machine/types';
import { useIdScanMachine } from '../machine-provider';
import IdCountryAndTypeSelection from './pages/country-and-type-selection';
import IdScanFailed from './pages/id-scan-failed';
import ProcessingPhoto from './pages/processing-photo/processing-photo';
import RetryBackPhoto from './pages/retry-back-photo/retry-back-photo';
import RetryFrontPhoto from './pages/retry-front-photo/retry-front-photo';
import TakeOrUploadBackPhoto from './pages/take-or-upload-back-photo/take-or-upload-back-photo';
import TakeOrUploadFrontPhoto from './pages/take-or-upload-front-photo/take-or-upload-front-photo';

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
  if (state.matches(States.takeOrUploadFrontPhoto)) {
    return <TakeOrUploadFrontPhoto />;
  }
  if (state.matches(States.takeOrUploadBackPhoto)) {
    return <TakeOrUploadBackPhoto />;
  }
  if (state.matches(States.processingPhoto)) {
    return <ProcessingPhoto />;
  }
  if (state.matches(States.retryFrontPhoto)) {
    return <RetryFrontPhoto />;
  }
  if (state.matches(States.retryBackPhoto)) {
    return <RetryBackPhoto />;
  }
  if (state.matches(States.failure)) {
    return <IdScanFailed />;
  }

  return null;
};
export default IdScanFlow;
