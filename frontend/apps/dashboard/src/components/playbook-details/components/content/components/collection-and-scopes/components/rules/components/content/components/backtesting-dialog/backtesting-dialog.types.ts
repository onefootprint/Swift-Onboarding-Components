export type DateFilterRange = {
  startDate?: Date;
  endDate?: Date;
};

export type Page = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageIndex: number;
};
