import { mockRequest } from '@onefootprint/test-utils';
import { AuthMethodKind, type OnboardingConfig, type RuleBacktestingData } from '@onefootprint/types';
import { OnboardingConfigKind, OnboardingConfigStatus, OnboardingStatus } from '@onefootprint/types';
import { OnboardingDecisionRuleAction } from '@onefootprint/types/src/data/rule';

export const kycPlaybookFixture: OnboardingConfig = {
  id: 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX',
  name: 'Playbook KYC',
  key: 'ob_test_gc1cmZRQoF4MAWGVegTh6T',
  isLive: false,
  createdAt: '2023-10-26T16:52:52.535896Z',
  status: OnboardingConfigStatus.enabled,
  mustCollectData: [
    'email',
    'name',
    'dob',
    'full_address',
    'us_legal_status',
    'ssn9',
    'phone_number',
    'document.drivers_license,id_card,passport.none.require_selfie',
  ],
  optionalData: [],
  allowInternationalResidents: false,
  internationalCountryRestrictions: null,
  allowUsResidents: true,
  allowUsTerritoryResidents: false,
  isNoPhoneFlow: false,
  isDocFirstFlow: false,
  author: {
    kind: 'organization',
    member: 'John Doe (john.doe@acme.com)',
  },
  skipKyc: false,
  kind: OnboardingConfigKind.kyc,
  ruleSet: {
    version: 1,
  },
  documentsToCollect: null,
  promptForPasskey: true,
  businessDocumentsToCollect: [],
  requiredAuthMethods: [AuthMethodKind.phone],
  verificationChecks: [],
};

export const backtestedRulesFixture: RuleBacktestingData = {
  results: [
    {
      fpId: 'fp_0',
      currentStatus: OnboardingStatus.fail,
      historicalActionTriggered: OnboardingDecisionRuleAction.fail,
      backtestActionTriggered: OnboardingDecisionRuleAction.fail,
    },
    {
      fpId: 'fp_1',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.fail,
    },
    {
      fpId: 'fp_2',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.stepUpIdentitySsn,
    },
    {
      fpId: 'fp_3',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.stepUpIdentitySsn,
    },
    {
      fpId: 'fp_4',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.stepUpIdentitySsn,
    },
    {
      fpId: 'fp_5',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.stepUpIdentity,
    },
    {
      fpId: 'fp_6',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.stepUpPoA,
    },
    {
      fpId: 'fp_7',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.manualReview,
    },
    {
      fpId: 'fp_8',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.manualReview,
    },
    {
      fpId: 'fp_9',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.passWithManualReview,
    },
    {
      fpId: 'fp_10',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: null,
    },
    {
      fpId: 'fp_11',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: null,
    },
    {
      fpId: 'fp_12',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.fail,
    },
    {
      fpId: 'fp_13',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: OnboardingDecisionRuleAction.fail,
    },
  ],
  stats: {
    total: 14,
    countByHistoricalActionTriggered: {
      pass: 13,
      fail: 1,
    },
    countByBacktestActionTriggered: {
      fail: 4,
      step_up: 5,
      manual_review: 2,
      pass_with_manual_review: 1,
      pass: 2,
    },
    countByHistoricalAndBacktestActionTriggered: {
      fail: {
        fail: 1,
      },
      pass: {
        fail: 3,
        step_up: 5,
        manual_review: 2,
        pass_with_manual_review: 1,
        pass: 2,
      },
    },
  },
};

export const noneAffectedBacktestedRulesFixture: RuleBacktestingData = {
  results: [
    {
      fpId: 'fp_1',
      currentStatus: OnboardingStatus.fail,
      historicalActionTriggered: OnboardingDecisionRuleAction.fail,
      backtestActionTriggered: OnboardingDecisionRuleAction.fail,
    },
    {
      fpId: 'fp_2',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: null,
    },
    {
      fpId: 'fp_3',
      currentStatus: OnboardingStatus.pass,
      historicalActionTriggered: null,
      backtestActionTriggered: null,
    },
  ],
  stats: {
    total: 3,
    countByHistoricalActionTriggered: {
      pass: 2,
      fail: 1,
    },
    countByBacktestActionTriggered: {
      pass: 2,
      fail: 1,
    },
    countByHistoricalAndBacktestActionTriggered: {
      fail: {
        fail: 1,
      },
      pass: {
        pass: 2,
      },
    },
  },
};

export const emptyBacktestedRulesFixture: RuleBacktestingData = {
  results: [],
  stats: {
    total: 0,
    countByHistoricalActionTriggered: {},
    countByBacktestActionTriggered: {},
    countByHistoricalAndBacktestActionTriggered: {},
  },
};

export const withEvaluateRules = (
  response: RuleBacktestingData = backtestedRulesFixture,
  playbookId: string = kycPlaybookFixture.id,
) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbookId}/rules/evaluate`,
    response,
  });

export const withEvaluateRulesError = (playbookId: string = kycPlaybookFixture.id) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbookId}/rules/evaluate`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
