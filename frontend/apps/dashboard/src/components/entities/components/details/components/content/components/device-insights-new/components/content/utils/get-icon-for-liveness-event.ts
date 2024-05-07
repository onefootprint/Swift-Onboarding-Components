import type { Color } from '@onefootprint/design-tokens';
import type { Liveness } from '@onefootprint/types';
import { icoForUserAgent } from 'src/utils/user-agent';

const getIconForLivenessEvent = (liveness: Liveness, color?: Color) => {
  const {
    insight: { userAgent },
    linkedAttestations,
  } = liveness;

  const attestation = linkedAttestations.at(0);
  const deviceInfo = {
    appClip: attestation?.deviceType === 'ios',
    instantApp: attestation?.deviceType === 'android',
    web: !attestation,
  };

  const headerIcon = icoForUserAgent(
    userAgent ?? '',
    deviceInfo.instantApp,
    deviceInfo.appClip,
    color ?? 'quinary',
  );

  return headerIcon;
};

export default getIconForLivenessEvent;
