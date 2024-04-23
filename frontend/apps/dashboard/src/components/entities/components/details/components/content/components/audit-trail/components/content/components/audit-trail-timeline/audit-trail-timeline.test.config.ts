import { mockRequest } from '@onefootprint/test-utils';
import type {
  Entity,
  GetEntityRuleSetResultResponse,
  RuleResult,
  Timeline,
  TimelineEvent,
} from '@onefootprint/types';
import {
  ActorKind,
  CollectedKycDataOption,
  DecisionStatus,
  DocumentRequestKind,
  EntityKind,
  EntityLabel,
  EntityStatus,
  IdDI,
  LivenessIssuer,
  LivenessSource,
  OnboardingDecisionRuleAction,
  RuleAction,
  RuleOp,
  TimelineEventKind,
  TriggerKind,
  Vendor,
} from '@onefootprint/types';
import { WorkflowStartedEventKind } from '@onefootprint/types/src/data/timeline';

export const entityIdFixure = 'fp_id_cDsFPmDwz784hdwovghMqt';
export const obcIdFixture = 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX';

export const entityFixture: Entity = {
  id: entityIdFixure,
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [IdDI.phoneNumber],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'obc_123',
    },
  ],
};

export const TimelineFixture: Timeline = [
  {
    event: {
      kind: TimelineEventKind.labelAdded,
      data: {
        kind: EntityLabel.active,
      },
    },
    timestamp: '2022-11-08T10:21:33.931738Z',
  },
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKycDataOption.name,
          CollectedKycDataOption.dob,
          CollectedKycDataOption.ssn9,
          CollectedKycDataOption.address,
          CollectedKycDataOption.email,
          CollectedKycDataOption.phoneNumber,
        ],
        isPrefill: false,
      },
    },
    timestamp: '2022-11-08T20:21:33.931738Z',
  },
  {
    event: {
      kind: TimelineEventKind.liveness,
      data: {
        source: LivenessSource.skipped,
        attributes: {
          metadata: null,
          issuers: [LivenessIssuer.google, LivenessIssuer.apple],
          device: 'iPhone 14',
          os: 'iOS',
        },
        insightEvent: {
          timestamp: '2022-11-08T20:21:49.971354Z',
          ipAddress: '104.28.39.72',
          city: 'Nashua',
          country: 'United States',
          region: 'NH',
          regionName: 'New Hampshire',
          latitude: 42.7628,
          longitude: -71.4674,
          metroCode: '506',
          postalCode: '03061',
          timeZone: 'America/New_York',
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        },
      },
    },
    timestamp: '2022-11-08T20:21:49.979139Z',
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_mxioMGjVUQJhbemA20OFi3',
          status: DecisionStatus.pass,
          timestamp: new Date('2022-11-08T20:21:53.750904Z'),
          source: {
            kind: ActorKind.footprint,
          },
          obConfiguration: {
            id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
            name: 'My Playbook',
            mustCollectData: [
              CollectedKycDataOption.name,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn9,
              CollectedKycDataOption.address,
              CollectedKycDataOption.email,
              CollectedKycDataOption.phoneNumber,
            ],
          },
          vendors: [Vendor.idology],
        },
        annotation: null,
      },
    },
    timestamp: '2022-11-08T20:21:53.752388Z',
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_kaI2ycxFAND4MpzdsYw64I',
          status: DecisionStatus.stepUpRequired,
          timestamp: new Date('2022-11-08T20:21:53.769699Z'),
          source: {
            kind: ActorKind.footprint,
          },
          obConfiguration: {
            id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
            name: 'My Playbook',
            mustCollectData: [
              CollectedKycDataOption.name,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn9,
              CollectedKycDataOption.address,
              CollectedKycDataOption.email,
              CollectedKycDataOption.phoneNumber,
            ],
          },
          vendors: [Vendor.idology],
        },
        annotation: null,
      },
    },
    timestamp: '2022-11-08T20:21:53.771495Z',
  },
  {
    event: {
      kind: TimelineEventKind.vaultCreated,
      data: {
        actor: {
          kind: ActorKind.apiKey,
          id: 'api_key_1234',
          name: 'Production key',
        },
      },
    },
    timestamp: '2022-11-08T20:21:53.771495Z',
  },
  {
    event: {
      kind: TimelineEventKind.workflowTriggered,
      data: {
        requestIsActive: false,
        config: {
          kind: TriggerKind.Document,
          data: {
            configs: [
              {
                kind: DocumentRequestKind.Identity,
                data: {
                  collectSelfie: true,
                },
              },
            ],
          },
        },
        actor: {
          kind: ActorKind.organization,
          member: 'Piip Penguin (piip@onefootprint.com)',
        },
        note: 'Hello today, please upload your flerpderp',
      },
    },
    timestamp: '2022-11-08T20:21:53.771495Z',
  },
  {
    event: {
      kind: TimelineEventKind.workflowStarted,
      data: {
        playbook: {
          id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
          name: 'My Playbook',
          mustCollectData: [],
        },
        kind: WorkflowStartedEventKind.playbook,
      },
    },
    timestamp: '2022-11-08T20:21:53.771495Z',
  },
];

export const WorkflowTriggeredWithLinkEvent: TimelineEvent = {
  event: {
    kind: TimelineEventKind.workflowTriggered,
    data: {
      requestIsActive: true,
      config: {
        kind: TriggerKind.Onboard,
        data: {
          playbookId: obcIdFixture,
        },
      },
      actor: {
        kind: ActorKind.organization,
        member: 'Piip Penguin (piip@onefootprint.com)',
      },
    },
  },
  timestamp: '2022-11-08T20:21:53.771495Z',
};

export const DocumentWorkflowStarted: TimelineEvent = {
  event: {
    kind: TimelineEventKind.workflowStarted,
    data: {
      playbook: {
        id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
        name: 'My Playbook',
        mustCollectData: [],
      },
      kind: WorkflowStartedEventKind.document,
    },
  },
  timestamp: '2022-11-08T20:21:53.771495Z',
};

export const ruleResultsFixture: RuleResult[] = [
  {
    result: true,
    rule: {
      ruleId: 'rule_MsUPlKcWagUEbpB4SIIzlp',
      action: RuleAction.fail,
      createdAt: '2023-12-05T23:37:22.943739Z',
      ruleExpression: [
        {
          field: 'subject_deceased',
          op: RuleOp.eq,
          value: true,
        },
      ],
      isShadow: false,
    },
  },
  {
    result: true,
    rule: {
      ruleId: 'rule_Zr3KN36uSLD9hTuiHbJHVz',
      action: RuleAction.fail,
      createdAt: '2021-11-26T16:52:52.535896Z',
      isShadow: false,
      ruleExpression: [
        { field: 'name_matches', op: RuleOp.notEq, value: true },
        { field: 'id_not_located', op: RuleOp.eq, value: true },
        { field: 'watchlist_hit_ofac', op: RuleOp.eq, value: true },
      ],
    },
  },
  {
    result: false,
    rule: {
      ruleId: 'rule_sufY6KAthSHuaWS9bzo8xt',
      action: RuleAction.fail,
      createdAt: '2020-12-05T23:37:22.943740Z',
      ruleExpression: [
        {
          field: 'id_flagged',
          op: RuleOp.eq,
          value: true,
        },
      ],
      isShadow: false,
    },
  },
  {
    result: false,
    rule: {
      ruleId: 'rule_y0szjzoMrHRhevmzeTvHSV',
      action: RuleAction.manualReview,
      createdAt: '2023-11-27T23:36:30.695149Z',
      ruleExpression: [
        {
          field: 'watchlist_hit_ofac',
          op: RuleOp.eq,
          value: true,
        },
      ],
      isShadow: false,
    },
  },
  {
    result: false,
    rule: {
      ruleId: 'rule_QCzXqumr8OLk71ABBk9yEN',
      action: RuleAction.passWithManualReview,
      createdAt: '2023-12-05T23:37:22.943740Z',
      ruleExpression: [
        {
          field: 'document_is_permit_or_provisional_license',
          op: RuleOp.eq,
          value: true,
        },
      ],
      isShadow: false,
    },
  },
];

export const ruleResultFixture: GetEntityRuleSetResultResponse = {
  actionTriggered: OnboardingDecisionRuleAction.fail,
  createdAt: '2024-01-05T23:37:22.943740Z',
  obConfigurationId: obcIdFixture,
  ruleResults: ruleResultsFixture,
};

export const withRuleSetResult = (
  response: GetEntityRuleSetResultResponse = ruleResultFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityIdFixure}/rule_set_result`,
    response,
  });
