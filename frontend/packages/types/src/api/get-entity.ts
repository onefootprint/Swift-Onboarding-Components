import type { Entity, OnboardingStatus } from '../data';

export type GetEntityRequest = {
  id: string;
};

export type GetEntityResponse = Entity<OnboardingStatus | undefined>;
