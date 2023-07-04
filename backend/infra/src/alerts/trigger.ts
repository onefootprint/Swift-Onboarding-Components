import * as pulumi from '@pulumi/pulumi';
import { Query } from './query';

export interface Threshold {
  op: '>' | '>=' | '<' | '<=';
  value: number;
}

export interface SlackRecipientDetails {
  slack_channel: string;
}

export interface WebhookRecipientDetails {
  webhook_name: string;
  webhook_url: string;
  webhook_secret: string;
}

export interface Recipient {
  type: 'slack' | 'webhook';
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
