import useDeviceInfo, {
  DeviceInfo,
} from 'footprint-ui/src/hooks/use-device-info';
import has from 'lodash/has';
import React from 'react';
import { Events, States } from 'src/utils/state-machine/liveness-check/types';
import withProvider from 'src/utils/with-provider';

import LivenessCheckMachineProvider from './components/machine-provider';
import useLivenessCheckMachine from './hooks/use-liveness-check-machine';
import LivenessCheckFailure from './pages/liveness-check-failure';
import LivenessCheckSuccess from './pages/liveness-check-success';
import NewTabProcessing from './pages/new-tab-processing';
import NewTabRequest from './pages/new-tab-request';
import QRCodeScanned from './pages/qr-code-scanned';
import QRCodeSent from './pages/qr-code-sent';
import QRRegister from './pages/qr-register';

type Page = {
  [page in States]?: () => JSX.Element;
};

const LivenessCheck = () => {
  const [state, send] = useLivenessCheckMachine();
  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });
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

export default () => withProvider(LivenessCheckMachineProvider, LivenessCheck);
