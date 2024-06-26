import type { AuthEvent } from '@onefootprint/types';

const getKeyForLiveness = (liveness: AuthEvent) =>
  `${liveness.insight.timestamp}-${liveness.insight.latitude}-${liveness.insight.longitude}-${liveness.kind}-${liveness.scope}`;

export default getKeyForLiveness;
