import type { AddTagRequest, CreateOrgTagRequest, RemoveTagRequest } from '@onefootprint/types';

export type EditedTag = {
  id?: string;
  text: string;
};

export type EditTagsData = {
  create: CreateOrgTagRequest[];
  add: AddTagRequest[];
  remove: RemoveTagRequest[];
};
