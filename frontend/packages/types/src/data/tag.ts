export type Tag = {
  text: string;
  createdAt: string;
};

export type TagWithId = Tag & {
  id: string;
};
