import { Trigger } from './trigger';

// The minimal set of information needed to define an alert
type Alert = Omit<
  Trigger,
  'recipients' | 'alert_type' | 'evaluation_schedule_type' | 'frequency'
> & { datasetName: string };

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
    threshold: {
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
    threshold: {
      op: '>',
      value: 0,
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
    threshold: {
      op: '>',
      value: 0,
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
    threshold: {
      op: '>',
      value: 50,
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
    threshold: {
      op: '>',
      value: 50,
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
    threshold: {
      op: '>',
      value: 50,
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
    threshold: {
      op: '>',
      value: 0,
    },
  },
];
