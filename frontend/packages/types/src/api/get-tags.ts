import type { TagWithId } from '../data';

export type GetTagsResponse = (Omit<TagWithId, 'text'> & {
  tag: string;
})[];
