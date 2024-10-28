export type SecurityLogsQueryString = {
  data_attributes_business?: string[];
  data_attributes_personal?: string[];
  date_range?: string | string[];
  search?: string;
};

export type SecurityLogsFilterValues = {
  dataAttributesBusiness: string[];
  dataAttributesPersonal: string[];
  dateRange: string[];
  search: string;
};
