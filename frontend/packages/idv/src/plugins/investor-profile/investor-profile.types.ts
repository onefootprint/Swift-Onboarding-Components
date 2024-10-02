import type { CollectInvestorProfileRequirement } from '@onefootprint/types';
import type { CommonIdvContext } from '../../utils/state-machine';

type InvestorProfileContext = {
  showTransition?: boolean;
  investorRequirement?: CollectInvestorProfileRequirement;
};

export type InvestorProfileProps = {
  context: InvestorProfileContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};
