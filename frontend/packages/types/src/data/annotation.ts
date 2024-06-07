import type { ActorApiKey, ActorFirmEmployee, ActorFootprint, ActorOrganization } from './actor';

export type AnnotationSource = ActorFootprint | ActorOrganization | ActorFirmEmployee | ActorApiKey;

export type Annotation = {
  id: string;
  note: string;
  isPinned: boolean;
  source: AnnotationSource;
  timestamp: string;
};
