import type { ChallengeData, ChallengeKind } from '@onefootprint/types';

import type { UserChallengeKind } from '@/src/types';

type Data = Pick<ChallengeData, 'challengeKind' | 'retryDisabledUntil'>;

const shouldRequestNewChallenge = (
  data: Partial<Data> | undefined,
  kind: `${ChallengeKind}` | `${UserChallengeKind}`,
) => {
  const hasPreferredChallengeKind = data?.challengeKind === kind;
  if (!hasPreferredChallengeKind) {
    return true;
  }
  const isRetryDisabled =
    data?.retryDisabledUntil && data.retryDisabledUntil > new Date();
  if (isRetryDisabled) {
    return false;
  }
  return true;
};

export default shouldRequestNewChallenge;
