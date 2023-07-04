import { Trigger, Threshold } from './trigger';
import { Query } from './query';

// The minimal set of information needed to define an alert
export interface Alert {
  name: string;
  description?: string;
  datasetName: string;
  disabled?: boolean;
  query: Query;
  slackThreshold: Threshold;
  pageThreshold?: Threshold;
}

export const Alerts: Alert[] = [
  {
    name: 'HTTP 5xx Errors',
    description: 'HTTP 5xx as reported by the application server',
    datasetName: 'fpc-api',
    query: {
      time_range: 240,
      breakdowns: ['http.method', 'http.route', 'http.status_code'],
      calculations: [
        {
          op: 'COUNT',
        },
      ],
      filters: [
        {
          column: 'trace.parent_id',
          op: 'does-not-exist',
        },
        {
          column: 'http.status_code',
          op: '>=',
          value: 500,
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 0,
    },
    // These won't make a ton of sense to page on for a while - we might want to page on a 5xx percentage
    pageThreshold: {
      op: '>',
      value: 10,
    },
  },
  // We probably don't want to have alerts on every 4xx in the future, but for now it's nice to keep tabs on our tenants' activity
  {
    name: 'HTTP 4xx Errors',
    description:
      'HTTP 4xx as reported by the application server. These are duplicates of the observe alerts, which we will soon deprecate if we like this.',
    datasetName: 'fpc-api',
    query: {
      time_range: 240,
      breakdowns: ['http.method', 'http.route', 'http.status_code'],
      calculations: [
        {
          op: 'COUNT',
        },
      ],
      filters: [
        {
          column: 'trace.parent_id',
          op: 'does-not-exist',
        },
        {
          column: 'http.status_code',
          op: '>=',
          value: 400,
        },
        {
          column: 'http.status_code',
          op: '<',
          value: 500,
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 0,
    },
  },
  {
    name: 'ALB Target 5xx Errors',
    description:
      'Elevated 5xx that originated from the loadbalancer target. This will likely fire any time the HTTP 5xx errors alert fires',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['LoadBalancer'],
      calculations: [
        {
          op: 'SUM',
          column:
            'amazonaws.com/AWS/ApplicationELB/HTTPCode_Target_5XX_Count.avg',
        },
      ],
      filters: [
        {
          column: 'LoadBalancer',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 0,
    },
    // These won't make a ton of sense to page on for a while - we might want to page on a 5xx percentage
    pageThreshold: {
      op: '>',
      value: 10,
    },
  },
  {
    name: 'ALB 5xx Errors',
    description:
      'Elevated 5xx that originated from the loadbalancer. This specifically does not includes 5xx that originated from the loadbalancer target (the application)',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['LoadBalancer'],
      calculations: [
        {
          op: 'SUM',
          column: 'amazonaws.com/AWS/ApplicationELB/HTTPCode_ELB_5XX_Count.avg',
        },
      ],
      filters: [
        {
          column: 'LoadBalancer',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 0,
    },
    pageThreshold: {
      op: '>',
      value: 10,
    },
  },
  {
    name: 'ECS Cluster High CPU',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['ClusterName'],
      calculations: [
        {
          op: 'MAX',
          column: 'CpuUtilizationPercentage',
        },
      ],
      filters: [
        {
          column: 'ClusterName',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 50,
    },
    pageThreshold: {
      op: '>',
      value: 80,
    },
  },
  {
    name: 'ECS Cluster High Memory Use',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['ClusterName'],
      calculations: [
        {
          op: 'SUM',
          column: 'MemoryUtilizationPercentage',
        },
      ],
      filters: [
        {
          column: 'ClusterName',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 50,
    },
    pageThreshold: {
      op: '>',
      value: 80,
    },
  },
  {
    name: 'High RDS CPU',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['DBClusterIdentifier', 'Role'],
      calculations: [
        {
          op: 'MAX',
          column: 'amazonaws.com/AWS/RDS/CPUUtilization.max',
        },
      ],
      filters: [
        {
          column: 'DBClusterIdentifier',
          op: 'exists',
        },
        {
          column: 'Role',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 50,
    },
    pageThreshold: {
      op: '>',
      value: 80,
    },
  },
  {
    name: 'Unhealthy Host for Loadbalancer Target',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['TargetGroup'],
      calculations: [
        {
          op: 'SUM',
          column: 'amazonaws.com/AWS/ApplicationELB/UnHealthyHostCount.max',
        },
      ],
      filters: [
        {
          column: 'TargetGroup',
          op: 'exists',
        },
      ],
      filter_combination: 'AND',
    },
    slackThreshold: {
      op: '>',
      value: 0,
    },
    pageThreshold: {
      op: '>',
      value: 2,
    },
  },
];
