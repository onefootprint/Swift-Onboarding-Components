import { DecisionAnnotation } from '../data/decision-annotation';

export type GetPinnedAnnotationsRequest = {
  entityId: string;
};

export type GetPinnedAnnotationsResponse = DecisionAnnotation[];
