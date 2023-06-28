import { Query } from './query';

export interface Threshold {
  op: '>' | '>=' | '<' | '<=';
  value: number;
}

export interface Recipient {
  // TODO don't know what to provide ehre
  id?: string;
  type: 'slack';
  target: string;
}

/// https://docs.honeycomb.io/api/triggers/#fields-on-a-trigger
export interface Trigger {
  name: string;
  description?: string;
  disabled?: boolean;
  query?: Query;
  query_id?: string;
  threshold: Threshold;
  frequency: number; // Check frequency in seconds, between 60 and
  alert_type: 'on_change' | 'on_true';
  evaluation_schedule_type: 'frequency' | 'window';
  evaluation_schedule?: any;
  recipients: Recipient[];
}
