import type { Liveness } from '@onefootprint/types';

const getKeyForLiveness = (liveness: Liveness) =>
  `${liveness.insight.timestamp}-${liveness.kind}-${liveness.scope}`;

export default getKeyForLiveness;
