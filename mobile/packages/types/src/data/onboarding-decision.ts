import {
  ActorApiKey,
  ActorFirmEmployee,
  ActorFootprint,
  ActorOrganization,
} from './actor';
import { CollectedDataOption } from './collected-data-option';
import DecisionStatus from './decision-status';
import Vendor from './vendor';

export type DecisionSource =
  | ActorFootprint
  | ActorOrganization
  | ActorFirmEmployee
  | ActorApiKey;

export type OnboardingDecision = {
  id: string;
  status: DecisionStatus;
  timestamp: Date;
  source: DecisionSource;
  obConfiguration: {
    mustCollectData: CollectedDataOption[];
    mustCollectIdentityDocument: boolean;
    // TODO: replace with the following
    // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
    // collectedIdDocuments: IdDocType[];
  };
  vendors: Vendor[];
};
