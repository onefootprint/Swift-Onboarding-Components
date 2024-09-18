import { route53 } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { Certificate } from './certs';
import { StackEnvironment, StackMetadata } from './stack_metadata';

export const RATE_LIMIT_EXCEEDED_RESPONSE_BODY_KEY = 'RateLimitExceeded';


function countAction() {
    return {
      count: {}
    };
}

function rateLimitExceededAction() {
  return {
    block: {
      customResponse: {
        responseCode: 429,
        customResponseBodyKey: RATE_LIMIT_EXCEEDED_RESPONSE_BODY_KEY,
      },
    },
  };
}

export const APP_CDN_WAF_RULES = [
    awsManagedRule('AWSManagedRulesAmazonIpReputationList', 0, true),
    awsManagedRule('AWSManagedRulesCommonRuleSet', 1, false),
    awsManagedRule('AWSManagedRulesKnownBadInputsRuleSet', 2, true),
    ipBlockRule({
      name: 'BlockedIpSet',
      priority: 3,
    }),
    ipRateLimitRule({
      name: 'IpRateLimitRule',
      priority: 4,
    }),
    sandboxApiIpRateLimitRule({
      name: 'SandboxApiIpRateLimitRule',
      priority: 5,
    }),
    liveApiKeyRateLimitRule({
      name: 'LiveApiKeyRateLimitRule',
      header: 'x-footprint-secret-key',
      action: rateLimitExceededAction(),
      priority: 6,
    }),
    liveApiKeyRateLimitRule({
      name: 'LiveApiKeyBasicAuthRateLimitRule',
      header: 'authorization',
      action: countAction(),
      priority: 7,
    }),
    sandboxApiKeyRateLimitRule({
      name: 'SandboxApiKeyRateLimitRule',
      header: 'x-footprint-secret-key',
      action: rateLimitExceededAction(),
      priority: 8,
    }),
    sandboxApiKeyRateLimitRule({
      name: 'SandboxApiKeyBasicAuthRateLimitRule',
      header: 'authorization',
      action: countAction(),
      priority: 9,
    }),
    dashboardKeyRateLimitRule({
      name: 'DashboardKeyRateLimitRule',
      priority: 10,
    }),
];

function awsManagedRule(name: string, priority: number, sample: boolean) {
  return {
    name: name,
    priority: priority,
    // TODO: block?
    overrideAction: {
      count: {},
    },
    statement: {
      managedRuleGroupStatement: {
        name: name,
        vendorName: 'AWS',
      },
    },
    visibilityConfig: {
      metricName: name,
      cloudwatchMetricsEnabled: true,
      sampledRequestsEnabled: sample,
    },
  };
}

// WAF rule to block requests from specific IP addresses, to respond to DOS
// attacks or other abuse.
function ipBlockRule(args: { name: string, priority: number})  {
  let blockedIpv4 = [
    // Entries must be in CIDR notation
    //
    // (These are IANA reserved addresses, as examples)
    "203.0.113.0/32",
    "198.51.100.0/24",
    // Real blocked addresses below:
  ];

  let blockedIpv6 = [
    // Entries must be in CIDR notation
    //
    // (These are IANA reserved addresses, as examples)
    "2001:db8:ffff:ffff:ffff:ffff:ffff:ffff/128",
    "3fff::/20",
    // Real blocked addresses below:
  ];

  let ipv4Set = new aws.wafv2.IpSet(`${args.name}-ipv4-set`, {
    ipAddressVersion: 'IPV4',
    scope: 'CLOUDFRONT',
    addresses: blockedIpv4,
  });

  let ipv6Set = new aws.wafv2.IpSet(`${args.name}-ipv6-set`, {
    ipAddressVersion: 'IPV6',
    scope: 'CLOUDFRONT',
    addresses: blockedIpv6,
  });

  return {
    name: args.name,
    priority: args.priority,
    action: rateLimitExceededAction(),
    statement: {
      orStatement: {
        statements: [
          {
            ipSetReferenceStatement: {
              arn: ipv4Set.arn,
            }
          },
          {
            ipSetReferenceStatement: {
              arn: ipv6Set.arn,
            }
          }
        ]
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}

function ipRateLimitRule(args: {name: string, priority: number}) {
  return {
    name: args.name,
    priority: args.priority,
    action: rateLimitExceededAction(),
    statement: {
      rateBasedStatement: {
        limit: 10000,
        evaluationWindowSec: 60,
        aggregateKeyType: 'FORWARDED_IP',
        forwardedIpConfig: {
          headerName: 'x-forwarded-for',
          fallbackBehavior: 'NO_MATCH',
        }
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}

function sandboxApiIpRateLimitRule(args: {name: string, priority: number}) {
  return {
    name: args.name,
    priority: args.priority,
    action: rateLimitExceededAction(),
    statement: {
      rateBasedStatement: {
        limit: 100,
        evaluationWindowSec: 60,
        aggregateKeyType: 'FORWARDED_IP',
        forwardedIpConfig: {
          headerName: 'x-forwarded-for',
          fallbackBehavior: 'NO_MATCH',
        },
        scopeDownStatement: {
          byteMatchStatement: {
            fieldToMatch: {
              singleHeader: {
                name: 'x-footprint-secret-key',
              }
            },
            positionalConstraint: 'CONTAINS',
            searchString: 'sk_test_',
            textTransformations: [
              {
                priority: 0,
                type: 'NONE',
              }
            ],
          },
        },
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}

function liveApiKeyRateLimitRule(args: {name: string, header: string, action: object, priority: number}) {
  return {
    name: args.name,
    priority: args.priority,
    action: args.action,
    statement: {
      rateBasedStatement: {
        limit: 10000,
        evaluationWindowSec: 60,
        aggregateKeyType: 'CUSTOM_KEYS',
        customKeys: [
          {
            header: {
              name: args.header,
              textTransformations: [
                {
                  priority: 0,
                  type: 'REMOVE_NULLS',
                },
                {
                  priority: 1,
                  type: 'COMPRESS_WHITE_SPACE',
                }
              ]
            }
          }
        ],
        scopeDownStatement: {
          andStatement: {
            statements: [
              {
                byteMatchStatement: {
                  fieldToMatch: {
                    singleHeader: {
                      name: args.header,
                    }
                  },
                  positionalConstraint: 'CONTAINS',
                  searchString: 'sk_',
                  textTransformations: [
                    {
                      priority: 0,
                      type: 'NONE',
                    }
                  ],
                },
              },
              {
                notStatement: {
                  statements: [
                    {
                      byteMatchStatement: {
                        fieldToMatch: {
                          singleHeader: {
                            name: args.header,
                          }
                        },
                        positionalConstraint: 'CONTAINS',
                        searchString: 'sk_test_',
                        textTransformations: [
                          {
                            priority: 0,
                            type: 'NONE',
                          }
                        ],
                      },
                    }
                  ]
                }
              }
            ]
          }
        },
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}

function sandboxApiKeyRateLimitRule(args: {name: string, header: string, action: object, priority: number}) {
  return {
    name: args.name,
    priority: args.priority,
    action: args.action,
    statement: {
      rateBasedStatement: {
        limit: 1000,
        evaluationWindowSec: 60,
        aggregateKeyType: 'CUSTOM_KEYS',
        customKeys: [
          {
            header: {
              name: args.header,
              textTransformations: [
                {
                  priority: 0,
                  type: 'REMOVE_NULLS',
                },
                {
                  priority: 1,
                  type: 'COMPRESS_WHITE_SPACE',
                }
              ]
            }
          }
        ],
        scopeDownStatement: {
          byteMatchStatement: {
            fieldToMatch: {
              singleHeader: {
                name: args.header,
              }
            },
            positionalConstraint: 'CONTAINS',
            searchString: 'sk_test_',
            textTransformations: [
              {
                priority: 0,
                type: 'NONE',
              }
            ],
          },
        },
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}

function dashboardKeyRateLimitRule(args: {name: string, priority: number}) {
  return {
    name: args.name,
    priority: args.priority,
    action: rateLimitExceededAction(),
    statement: {
      rateBasedStatement: {
        limit: 5000,
        evaluationWindowSec: 60,
        aggregateKeyType: 'CUSTOM_KEYS',
        customKeys: [
          {
            header: {
              name: 'x-fp-dashboard-authorization',
              textTransformations: [
                {
                  priority: 0,
                  type: 'REMOVE_NULLS',
                },
                {
                  priority: 1,
                  type: 'COMPRESS_WHITE_SPACE',
                }
              ]
            }
          }
        ],
        scopeDownStatement: {
          sizeConstraintStatement: {
            fieldToMatch: {
              singleHeader: {
                name: 'x-fp-dashboard-authorization',
              }
            },
            comparisonOperator: 'GT',
            size: 0,
            textTransformations: [
              {
                priority: 0,
                type: 'NONE',
              }
            ],
          },
        },
      }
    },
    visibilityConfig: {
      metricName: args.name,
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    }
  };
}
