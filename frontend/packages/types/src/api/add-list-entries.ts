import type { ListEntry } from '../data';

export type AddListEntriesRequest = {
  listId: string;
  entries: string[];
};

export type AddListEntriesResponse = ListEntry[];
