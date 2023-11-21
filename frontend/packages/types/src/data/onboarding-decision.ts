import type { Actor } from './actor';
import type { CollectedDataOption } from './collected-data-option';
import type DecisionStatus from './decision-status';
import type Vendor from './vendor';

export type OnboardingDecision = {
  id: string;
  status: DecisionStatus;
  timestamp: Date;
  source: Actor;
  obConfiguration: {
    id: string;
    name: string;
    mustCollectData: CollectedDataOption[];
    // TODO: replace with the following
    // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
    // collectedIdDocuments: IdDocType[];
  };
  vendors: Vendor[];
};
