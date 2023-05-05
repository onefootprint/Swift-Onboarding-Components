import { DecisionSourceOrganization } from './onboarding-decision';

export type Annotation = {
  id: string;
  note: string;
  isPinned: boolean;
  source: DecisionSourceOrganization;
  timestamp: Date;
};
