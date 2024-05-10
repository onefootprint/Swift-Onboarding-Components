import type { Liveness } from '@onefootprint/types';

const getKeyForLiveness = (liveness: Liveness) =>
  `${liveness.insight.timestamp}-${liveness.insight.latitude}-${liveness.insight.longitude}`;

export default getKeyForLiveness;
