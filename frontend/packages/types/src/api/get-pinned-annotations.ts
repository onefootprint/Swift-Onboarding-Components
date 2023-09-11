import type { Annotation } from '../data';

export type GetPinnedAnnotationsRequest = {
  entityId: string;
};

export type GetPinnedAnnotationsResponse = Annotation[];
