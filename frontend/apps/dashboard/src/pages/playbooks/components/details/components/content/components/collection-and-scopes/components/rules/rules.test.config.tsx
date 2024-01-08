import {
  mockRequest,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import {
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
  type Rule,
  RuleAction,
  RuleOp,
} from '@onefootprint/types';

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
  canAccessData: [
    'email',
    'phone_number',
    'name',
    'dob',
    'full_address',
    'ssn9',
    'us_legal_status',
    'document.drivers_license,id_card,passport.none.require_selfie',
  ],
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
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
  kind: OnboardingConfigKind.kyc,
};

export const kybPlaybookFixture: OnboardingConfig = {
  id: 'ob_config_id_Vwyu5yLZbnXFwrC4RwFnDp',
  name: 'KYB',
  key: 'pb_test_u29z2AvnfqhGKpIb4f0raa',
  isLive: false,
  createdAt: '2024-01-02T20:12:20.301907Z',
  status: OnboardingConfigStatus.enabled,
  mustCollectData: [
    'email',
    'name',
    'dob',
    'full_address',
    'ssn9',
    'phone_number',
    'business_name',
    'business_address',
    'business_tin',
    'business_beneficial_owners',
  ],
  optionalData: [],
  canAccessData: [
    'email',
    'phone_number',
    'name',
    'dob',
    'full_address',
    'ssn9',
    'business_name',
    'business_address',
    'business_tin',
    'business_beneficial_owners',
  ],
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
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
  kind: OnboardingConfigKind.kyb,
};

export const multiFieldRuleFixture = {
  ruleId: 'rule_Zr3KN36uSLD9hTuiHbJHVz',
  action: RuleAction.fail,
  createdAt: '2021-11-26T16:52:52.535896Z',
  isShadow: false,
  ruleExpression: [
    { field: 'name_matches', op: RuleOp.notEq, value: true },
    { field: 'id_not_located', op: RuleOp.eq, value: true },
    { field: 'watchlist_hit_ofac', op: RuleOp.eq, value: true },
  ],
};

export const manualReviewRuleFixture = {
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
};

export const passRuleFixture = {
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
};

export const stepUpRuleFixture = {
  ruleId: 'rule_KkNDHeqFUFLsuKLhNRZ4c8',
  action: RuleAction.passWithManualReview,
  createdAt: '2023-12-05T23:37:22.943740Z',
  ruleExpression: [
    {
      field: 'dob_does_not_match',
      op: RuleOp.notEq,
      value: true,
    },
  ],
  isShadow: false,
};

export const rulesFixture: Rule[] = [
  {
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
  multiFieldRuleFixture,
  {
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
  manualReviewRuleFixture,
  passRuleFixture,
];

export const startEditing = async (title: string) => {
  const failSection = screen.getByRole('group', {
    name: title,
  });
  const [firstRuleRow] = within(failSection).queryAllByRole('row');

  const editButton = within(firstRuleRow).getByText('Edit');
  await userEvent.click(editButton);
  await waitFor(() => {
    expect(editButton).not.toBeInTheDocument();
  });
  return firstRuleRow;
};

export const startAdding = async (title: string) => {
  const section = screen.getByRole('group', {
    name: title,
  });
  const addRuleButton = within(section).getByRole('button', {
    name: 'Add rule',
  });
  await userEvent.click(addRuleButton);
  await waitFor(() => {
    expect(addRuleButton).toBeDisabled();
  });
  return section;
};

export const isPrecededByNotBadge = ({
  row,
  text,
}: {
  row: HTMLElement;
  text: string;
}) => {
  const rowNodes = Array.from(Array.from(row.children)[0].children);
  const notBadge = within(row).getByText('not');
  const notIndex = rowNodes.indexOf(notBadge);
  const notFieldElement = within(row).getByText(text);
  const fieldIndex = rowNodes.indexOf(notFieldElement);
  return notIndex === fieldIndex - 1;
};

export const withRules = (
  playbookId: string = kycPlaybookFixture.id,
  response: Rule[] = rulesFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/org/onboarding_configs/${playbookId}/rules`,
    response,
  });

export const withRulesError = (playbookId: string = kycPlaybookFixture.id) =>
  mockRequest({
    method: 'get',
    path: `/org/onboarding_configs/${playbookId}/rules`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withEditRule = (
  response: Rule,
  playbookId: string = kycPlaybookFixture.id,
) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${playbookId}/rules/${response.ruleId}`,
    response,
  });

export const withDeleteRule = (
  ruleId: string,
  playbookId: string = kycPlaybookFixture.id,
) =>
  mockRequest({
    method: 'delete',
    path: `/org/onboarding_configs/${playbookId}/rules/${ruleId}`,
    response: {},
  });

export const withAddRule = (
  response: Rule,
  playbookId: string = kycPlaybookFixture.id,
) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbookId}/rules`,
    response,
  });

export const withRiskSignals = () => {
  mockRequest({
    method: 'get',
    path: `/org/risk_signals`,
    response: [
      {
        id: '1',
        description:
          'The individual has lived at their current address for a short time.',
        note: 'Address longevity alert',
        reasonCode: 'address_alert_longevity',
        scopes: ['address'],
        severity: 'low',
      },
      {
        id: '2',
        reason_code: 'adverse_media_hit',
        note: 'Adverse media hit',
        description: 'A strong potential match with adverse media found',
        severity: 'high',
        scopes: ['name', 'dob'],
      },
      {
        id: '3',
        description: 'DOB located does not match input',
        note: 'Dob does not match',
        reasonCode: 'dob_does_not_match',
        scopes: ['dob'],
        severity: 'high',
      },
      {
        id: '4',
        description:
          'Either the located identity was flagged for elevated risk, or a confident match for the identity could not be found',
        note: 'Identity flagged for elevated risk',
        reasonCode: 'id_flagged',
        scopes: ['ssn', 'name', 'dob', 'address'],
        severity: 'high',
      },
      {
        id: '5',
        description:
          'Identity could not be located with the information provided',
        note: 'Identity not located',
        reasonCode: 'id_not_located',
        scopes: ['ssn', 'name', 'dob', 'address'],
        severity: 'high',
      },
      {
        id: '6',
        description: 'The located name matches the input name.',
        note: 'Name matches',
        reasonCode: 'name_matches',
        scopes: ['name'],
        severity: 'info',
      },
      {
        id: '7',
        description:
          'Records indicate that the subject in question is deceased.',
        note: 'Subject deceased',
        reasonCode: 'subject_deceased',
        scopes: ['ssn'],
        severity: 'high',
      },
      {
        id: '8',
        description:
          'A strong potential match on a governmental OFAC watchlist',
        note: 'OFAC watchlist hit',
        reasonCode: 'watchlist_hit_ofac',
        scopes: ['name', 'dob'],
        severity: 'high',
      },
      {
        id: '9',
        description:
          "The document provided was a provisional license or learner's permit",
        note: "Document is a learner's permit or provisional driver's license",
        reasonCode: 'document_is_permit_or_provisional_license',
        scopes: ['document'],
        severity: 'high',
      },
    ],
  });
};
