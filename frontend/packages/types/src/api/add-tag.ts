import type { TagWithId } from '../data';

export type AddTagRequest = {
  id: string;
  text: string;
};

export type AddTagResponse = Omit<TagWithId, 'text'> &
  {
    tag: string; // On frontend this field is 'text', but backend uses 'tag'
  }[];
