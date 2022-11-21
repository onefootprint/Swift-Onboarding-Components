import { DecisionSourceKind } from './onboarding-decision';

export type PinnedAnnotation = {
  id: string;
  isPinned: boolean;
  note: string;
  source: DecisionSourceKind;
  timestamp: string;
};
