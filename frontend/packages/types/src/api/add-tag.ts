import type { Tag } from '../data';

export type AddTagRequest = {
  entityId: string;
  text: string;
};

export type AddTagResponse = Tag[];
