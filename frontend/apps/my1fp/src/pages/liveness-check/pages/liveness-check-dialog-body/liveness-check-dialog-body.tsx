import useDeviceInfo, {
  DeviceInfo,
} from 'footprint-ui/src/hooks/use-device-info';
import has from 'lodash/has';
import React, { useEffect } from 'react';
import { Events, States } from 'src/utils/state-machine/liveness-check/types';

import useLivenessCheckMachine from '../../hooks/use-liveness-check-machine';
import LivenessCheckFailure from '../liveness-check-failure';
import LivenessCheckSuccess from '../liveness-check-success';
import NewTabProcessing from '../new-tab-processing';
import NewTabRequest from '../new-tab-request';
import QRCodeScanned from '../qr-code-scanned';
import QRCodeSent from '../qr-code-sent';
import QRRegister from '../qr-register';

type Page = {
  [page in States]?: () => JSX.Element;
};

type LivenessCheckDialogBodyProps = {
  onDone: () => void;
};

const LivenessCheckDialogBody = ({ onDone }: LivenessCheckDialogBodyProps) => {
  const [state, send] = useLivenessCheckMachine();
  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });
  useEffect(() => {
    if (state.done) {
      onDone();
    }
  }, [state.done, onDone]);

  const valueCasted = state.value as States;
  const pages: Page = {
    [States.newTabProcessing]: NewTabProcessing,
    [States.newTabRequest]: NewTabRequest,
    [States.qrCodeScanned]: QRCodeScanned,
    [States.qrCodeSent]: QRCodeSent,
    [States.qrRegister]: QRRegister,
    [States.livenessCheckFailed]: LivenessCheckFailure,
    [States.livenessCheckSucceeded]: LivenessCheckSuccess,
  };

  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default LivenessCheckDialogBody;
