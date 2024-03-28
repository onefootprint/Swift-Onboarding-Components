import type { CommonIdvContext } from '../../utils/state-machine';

export type InvestorProfileContext = {
  showTransition?: boolean;
};

export type InvestorProfileProps = {
  context: InvestorProfileContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};
