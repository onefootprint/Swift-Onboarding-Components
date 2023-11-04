import type { Entity } from '../data';

export type GetEntityRequest = {
  id: string;
};

export type GetEntityResponse = Entity;
