import type { Actor } from './actor';
import type { CollectedDataOption } from './collected-data-option';
import type DecisionStatus from './decision-status';
import type Vendor from './vendor';

export type OnboardingDecision = {
  id: string;
  status: DecisionStatus;
  timestamp: Date;
  source: Actor;
  obConfiguration: TimelinePlaybook;
  vendors: Vendor[];
};

export type TimelinePlaybook = {
  id: string;
  name: string;
  mustCollectData: CollectedDataOption[];
};
