import { DecisionSource } from './onboarding-decision';

export type DecisionAnnotation = {
  id: string;
  isPinned: boolean;
  note: string;
  source: DecisionSource;
  timestamp: string;
};
