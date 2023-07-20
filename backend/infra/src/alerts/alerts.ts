import { Trigger, Threshold } from './trigger';
import { Query } from './query';
import { GlobalState } from '../main';

// The minimal set of information needed to define an alert
export interface Alert {
  name: string;
  description?: string;
  datasetName: string;
  disabled?: boolean;
  query: Query;
  slackThreshold?: Threshold;
  pageThreshold?: Threshold;
}

export const Alerts: Alert[] = [
  {
    name: 'HTTP 5xx Errors',
    description: 'HTTP 5xx as reported by the application server',
    datasetName: 'fpc-api',
    query: {
      time_range: 240,
      breakdowns: [
        'http.method',
        'http.route',
        'http.status_code',
        'tenant_id',
      ],
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
  {
    name: 'Latent HTTP request',
    description: 'HTTP request took longer than 15s',
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
          column: 'http.route',
          op: 'exists',
        },
        {
          column: 'duration_ms',
          op: '>=',
          value: 15000,
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
      value: 5,
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
    name: 'ECS Service High CPU',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['ServiceName'],
      calculations: [
        {
          op: 'MAX',
          column: 'amazonaws.com/AWS/ECS/CPUUtilization.max',
        },
      ],
      filters: [
        {
          column: 'ServiceName',
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
    name: 'ECS Service High Memory Use',
    datasetName: 'aws',
    query: {
      time_range: 240,
      breakdowns: ['ServiceName'],
      calculations: [
        {
          op: 'MAX',
          column: 'amazonaws.com/AWS/ECS/MemoryUtilization.max',
        },
      ],
      filters: [
        {
          column: 'ServiceName',
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

export const generateAlerts = (g: GlobalState) => {
  const dynamicAlerts: Alert[] = [
    {
      name: 'API server scaled up',
      description:
        'The API server has scaled up. Autoscaling on the enclave is not set up yet - please check enclave health and prepare to scale up the enclave if needed.',
      datasetName: 'aws',
      query: {
        time_range: 240,
        breakdowns: ['TargetGroup'],
        calculations: [
          {
            op: 'MAX',
            column: 'amazonaws.com/AWS/ApplicationELB/HealthyHostCount.max',
          },
        ],
        filters: [
          {
            column: 'TargetGroup',
            op: 'exists',
          },
          {
            column: 'TargetGroup',
            op: 'contains',
            value: 'fpc-tg',
          },
        ],
        filter_combination: 'AND',
      },
      pageThreshold: {
        op: '>',
        // Alert when we've scaled up past the minimum number of instances
        value: g.constants.resources.minInstances,
      },
    },
  ];
  return dynamicAlerts.concat(Alerts);
};
