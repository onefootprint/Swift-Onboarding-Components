export type SecurityLogsQueryString = {
  data_attributes?: string | string[];
  date_range?: string | string[];
  search?: string;
};

export type SecurityLogsFilterValues = {
  dataAttributes: string[];
  dateRange: string[];
  search: string;
};
