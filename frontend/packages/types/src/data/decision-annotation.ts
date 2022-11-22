import { DecisionSourceKind } from './onboarding-decision';

export type DecisionAnnotation = {
  id: string;
  isPinned: boolean;
  note: string;
  source: DecisionSourceKind;
  timestamp: string;
};
