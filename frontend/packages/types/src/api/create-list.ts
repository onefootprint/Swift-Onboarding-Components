import type { List, ListKind } from '../data';

export type CreateListRequest = {
  alias: string;
  kind: ListKind;
  name: string;
  entries: string[];
};

export type CreateListResponse = List;
