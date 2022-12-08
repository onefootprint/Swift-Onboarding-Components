import { DecisionSource } from './onboarding-decision';

export type PinnedAnnotation = {
  id: string;
  isPinned: boolean;
  reason: string;
  note?: string;
  source: DecisionSource;
  timestamp: string;
};
