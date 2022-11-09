import { IcoClose16, IcoFaceid16, IcoLock16 } from '@onefootprint/icons';
import { LivenessEventData, LivenessSource } from '@onefootprint/types';
import React from 'react';

type LivenessEventIconProps = {
  data: LivenessEventData;
};

const LivenessEventIcon = ({ data }: LivenessEventIconProps) => {
  const { source } = data;
  if (source === LivenessSource.webauthnAttestation) {
    return <IcoFaceid16 />;
  }
  if (source === LivenessSource.privacyPass) {
    return <IcoLock16 />;
  }
  return <IcoClose16 />;
};

export default LivenessEventIcon;
