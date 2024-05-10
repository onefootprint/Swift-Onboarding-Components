import type { Liveness } from '@onefootprint/types';

const getKeyForLiveness = (liveness: Liveness) =>
  `${liveness.insight.timestamp}-${liveness.insight.latitude}-${liveness.insight.longitude}-${liveness.kind}-${liveness.scope}`;

export default getKeyForLiveness;
