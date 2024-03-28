import type { CommonIdvContext } from '../../utils/state-machine';

export type LivenessProps = {
  idvContext: CommonIdvContext;
  onDone: () => void;
};
