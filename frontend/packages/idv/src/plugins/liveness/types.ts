import type { UserChallengeActionKind } from '@onefootprint/types';
import type { CommonIdvContext } from '../../utils/state-machine';

export type LivenessProps = {
  actionKind: UserChallengeActionKind;
  idvContext: CommonIdvContext;
  onCustomSkip?: () => void;
  onDone: () => void;
};
