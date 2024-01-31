export type CalculationOp =
  | 'COUNT'
  | 'CONCURRENCY'
  | 'SUM'
  | 'AVG'
  | 'COUNT_DISTINCT'
  | 'MAX'
  | 'MIN'
  | 'P001'
  | 'P01'
  | 'P05'
  | 'P10'
  | 'P25'
  | 'P50'
  | 'P75'
  | 'P90'
  | 'P95'
  | 'P99'
  | 'P999'
  | 'HEATMAP'
  | 'RATE_AVG'
  | 'RATE_SUM'
  | 'RATE_MAX';

export interface Calculation {
  column?: string;
  op: CalculationOp;
}

export type FilterOp =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'starts-with'
  | 'does-not-start-with'
  | 'exists'
  | 'does-not-exist'
  | 'contains'
  | 'does-not-contain'
  | 'in'
  | 'not-in';

export interface Filter {
  column: string;
  op: FilterOp;
  value?: string | string[] | number | number[] | boolean;
}

export interface Order {
  column?: string;
  op: string;
  order: 'descending' | 'ascending';
}

export interface Query {
  /// Time since now (in seconds) to look back
  time_range?: number;
  breakdowns: string[];
  calculations: Calculation[];
  filters: Filter[];
  filter_combination: 'AND' | 'OR';
  // Unused
  // granularity?: number;
  // orders?: Order[];
  // limit?: number;
  // havings?: never[];
  // start_time: undefined;
  // end_time: undefined;
}
