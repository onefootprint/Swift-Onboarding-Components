import { DecisionSource } from './onboarding-decision';

export type PinnedAnnotation = {
  id: string;
  isPinned: boolean;
  note: string;
  source: DecisionSource;
  timestamp: string;
};
