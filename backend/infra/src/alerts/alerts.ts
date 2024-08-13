import {Threshold} from './trigger';
import {Query} from './query';
import {GlobalState} from '../main';

// The minimal set of information needed to define an alert
export interface Alert {
  name: string;
  description?: string;
  runbookUrl: string;
  datasetName: string;
  disabled?: boolean;
  query: Query;
  slackThreshold?: Threshold;
  pageThreshold?: Threshold;
}

/// Endpoints whose latency we never want to alert on
const IGNORE_LATENT_HTTP_ROUTES: string[] = [
  '/hosted/user/documents/{id}/upload/{side}', // Latency can be a function of user network connection :/
  '/hosted/documents/{id}/upload/{side}', // Latency can be a function of user network connection :/
  '/entities/{fp_id}/ai_summarize', // This is a long-running operation because of the OpenAI api
];
/// Generally higher-latency HTTP requests that we want to have a higher alert threshold
const LATENT_HTTP_ROUTES: string[] = [
  '/vault_proxy/reflect',
  '/hosted/user/documents/{id}/process',
  '/hosted/documents/{id}/process',
  '/hosted/onboarding/tel',
  '/hosted/onboarding/process',
  '/users/{fp_id}/kyc',
];

/// Note, add alert runbooks at: https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25
/// Also note: each query is evaluated for the last 240s. Set your thresholds accordingly.
const staticAlerts: Alert[] = [
  {
    name: 'HTTP 5xx Errors',
    description: 'HTTP 5xx as reported by the application server',
    datasetName: 'fpc-api',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#f9974c9bdc4c4b62878cbdf6ef7c55dc',
    query: {
      breakdowns: ['http.method', 'http.route', 'http.status_code', 'tenant_id'],
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
        {
          column: 'http.status_code',
          op: '!=',
          value: 502,
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
    name: 'Hosted API with invalid request',
    description: 'Errors to a /hosted API (used entirely by our clients) with an invalid request.',
    datasetName: 'fpc-api',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#f078e5125efa4da187c90dfa8d2ec61a',
    query: {
      breakdowns: ['http.route'],
      calculations: [
        {
          op: 'COUNT',
        },
      ],
      filters: [
        {
          column: 'http.status_code',
          op: '>',
          value: 299,
        },
        {
          column: 'is_integration_test_req',
          op: '!=',
          value: true,
        },
        {
          column: 'exception.details',
          op: 'contains',
          value: 'InvalidJsonBody',
        },
        {
          column: 'http.route',
          op: 'contains',
          value: 'hosted',
        },
        // Identify regularly sees these errors for providing an invalid email address.
        {
          column: 'http.route',
          op: '!=',
          value: '/hosted/identify',
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
    name: 'Latent HTTP request',
    description: 'HTTP request took longer than 15s',
    datasetName: 'fpc-api',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#1430bed953954300827cc3a07777a84f',
    query: {
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
        {
          column: 'http.route',
          op: 'not-in',
          value: IGNORE_LATENT_HTTP_ROUTES,
        },
        {
          column: 'http.route',
          op: 'not-in',
          value: LATENT_HTTP_ROUTES,
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
    name: 'Extra Latent HTTP request',
    description: 'HTTP request took longer than 60s',
    datasetName: 'fpc-api',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#1430bed953954300827cc3a07777a84f',
    query: {
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
          value: 60000,
        },
        {
          column: 'http.route',
          op: 'not-in',
          value: IGNORE_LATENT_HTTP_ROUTES,
        },
        {
          column: 'http.route',
          op: 'in',
          value: LATENT_HTTP_ROUTES,
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
    name: 'ALB 5xx Errors',
    description:
      'Elevated 5xx that originated from the loadbalancer. This specifically does not includes 5xx that originated from the loadbalancer target (the application)',
    datasetName: 'aws',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#b6d06909bf0e4a1689bbaaef62ebd8f0',
    query: {
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
    name: 'Cloudfront 5xx Errors',
    description: 'Elevated 5xx seen at cloudfront. This includes 5xxs from the application, ALB, and cloudfront.',
    datasetName: 'cloudfront',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#b6d06909bf0e4a1689bbaaef62ebd8f0',
    query: {
      breakdowns: ['cs_uri_stem'],
      calculations: [
        {
          op: 'COUNT',
        },
      ],
      filters: [
        {
          column: 'sc_status',
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
    pageThreshold: {
      op: '>',
      value: 10,
    },
  },
  {
    name: 'ECS Service High CPU',
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#06a4512609164a2e8fa42c6e41d13508',
    datasetName: 'aws',
    query: {
      breakdowns: ['ServiceName'],
      calculations: [
        {
          op: 'MAX',
          column: 'amazonaws.com/AWS/ECS/CPUUtilization.avg',
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
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#57b457736a274484b3768d1e7e7b9b92',
    datasetName: 'aws',
    query: {
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
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#ad0c4bebc4c44d3eab953d2e1aa10b55',
    datasetName: 'aws',
    query: {
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
    runbookUrl:
      'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#325f29c560a944a48a6d3cc0caad0ea4',
    datasetName: 'aws',
    query: {
      breakdowns: ['TargetGroup'],
      calculations: [
        {
          op: 'MAX',
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
      // ASG rolling update allows for 20% of hosts to be unhealthy (see config
      // for exact number), but under normal operation only one host is
      // unhealthy at a time.
      value: 1,
      exceeded_limit: 1,
    },
    pageThreshold: {
      op: '>',
      // Sustained unavailablity that doesn't look like an ASG rolling update.
      value: 2,
      exceeded_limit: 3,
    },
  },
];

export const generateAlerts = (g: GlobalState) => {
  const dynamicAlerts: Alert[] = [
    {
      name: 'API server scaled up',
      description:
        'The API server has scaled up. Autoscaling on the enclave is not set up yet - please check enclave health and prepare to scale up the enclave if needed.',
      runbookUrl:
        'https://www.notion.so/onefootprint/Alert-Runbooks-17f53ed91bb64a09b446bf2c0eb1cb25?pvs=4#bb124f8285ab4d6880c1ff282f22b27b',
      datasetName: 'aws',
      query: {
        breakdowns: ['ClusterName', 'ServiceName'],
        calculations: [
          {
            op: 'MAX',
            column: 'amazonaws.com/ECS/ContainerInsights/DesiredTaskCount.max',
          },
        ],
        // This may get noisy if we end up making multiple ECS clusters/services since the threshold
        // is only based on the API server task count
        filters: [
          {
            column: 'ClusterName',
            op: 'exists',
          },
          {
            column: 'ServiceName',
            op: 'exists',
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
  return dynamicAlerts.concat(staticAlerts);
};
