import { IcoFaceid16, IcoLock16 } from '@onefootprint/icons';
import {
  BiometricRegisteredEvent,
  BiometricRegistrationKind,
} from '@onefootprint/types';
import React from 'react';

type BiometricRegisteredEventIconProps = {
  data: BiometricRegisteredEvent;
};

const BiometricRegisteredEventIcon = ({
  data,
}: BiometricRegisteredEventIconProps) => {
  const { kind } = data;
  return kind === BiometricRegistrationKind.webauthn ? (
    <IcoFaceid16 />
  ) : (
    <IcoLock16 />
  );
};

export default BiometricRegisteredEventIcon;
