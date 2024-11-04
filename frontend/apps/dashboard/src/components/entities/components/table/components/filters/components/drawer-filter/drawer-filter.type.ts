export type Filters = {
  labels?: string[];
  tags?: string[];
  others?: string[];
  playbooks: Record<string, boolean>;
  externalId?: string;
};

export enum FiltersDateRange {
  AllTime = 'all-time',
  Today = 'today',
  Last7Days = 'last-7-days',
  Last30Days = 'last-30-days',
  Custom = 'custom',
}

export type FormData = {
  labels?: string[];
  tags?: string[];
  others?: string[];
  period: string;
  customDate: { from: Date; to: Date };
  playbooks: Record<string, boolean>;
  externalId?: string;
};
