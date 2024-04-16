export const companies = [
  {
    id: 'c_123',
    companyName: 'QuantumWorks Inc.',
    numActivePlaybooks: 10,
    numControlsComplete: 10,
    numControlsTotal: 10,
  },
  {
    id: 'c_124',
    companyName: 'PhoenixX Innovations',
    numActivePlaybooks: 10,
    numControlsComplete: 10,
    numControlsTotal: 10,
  },
];

export const members = [
  { label: 'Jay Zheng', value: 'orguser_PVpQbjmyuRFzqROLp9xWYb' },
  { label: 'Eric Chen', value: 'orguser_okPbpRGB8NfwsbbFCg1TCX' },
];

export const templates = [
  {
    label: 'Compliance Manual',
    value: 'cdtv_acfkyBvT7gjVRFFfo8dlDZ',
    templateId: 'cdt_qAwjfxWszMIcLxqn5PyTxf',
  },
  {
    label: 'Regulatory Compliance Checklist',
    value: 'cdtv_rHMCTif3VjIpOJs7L0PHGu',
    templateId: 'cdt_AvfgRfDyTzJOmxMyNWVVfR',
  },
];

export const unusedTemplates = [
  {
    value: 'cdtv_fPWpIkypwxocXQzUYlbff9',
    label: 'Anti-Money Laundering Policy',
  },
  {
    value: 'cdtv_mf7BmR1erN2sb7PmGuMxmq',
    label: 'Data Privacy Compliance',
  },
];

export const securityChecks = {
  accessControl: true,
  dataAccess: true,
  dataEndToEndEncryption: true,
  strongAuthentication: true,
};

export const documents = [
  {
    id: 'cd_4s7f7xgLTTp7wzznuP7077',
    name: 'Document A',
    description: 'Document A description',
    status: 'waiting_for_upload',
    partnerTenantAssignee: {
      id: 'orguser_okPbpRGB8NfwsbbFCg1TCX',
      firstName: 'Eric',
      lastName: 'Chen',
    },
    tenantAssignee: null,
    lastUpdated: '2024-04-09T21:10:29.629016Z',
    activeRequestId: 'cdreq_AAy1OAvb2xJvaVB0oaN4Da',
    activeSubmissionId: null,
    activeReviewId: null,
    templateId: null,
  },
  {
    id: 'cd_FuPuzMEvy5t0MydIGbO11T',
    name: 'Document B',
    description: '',
    status: 'waiting_for_upload',
    partnerTenantAssignee: null,
    tenantAssignee: null,
    lastUpdated: '2024-04-09T16:17:01.082770Z',
    activeRequestId: 'cdreq_6wnf7GZBgLgf0Tg0Ph03Qz',
    activeSubmissionId: null,
    activeReviewId: null,
    templateId: null,
  },
];

export const docEventSubmitted = {
  timestamp: '2024-04-11T15:22:28.291713Z',
  actor: {
    user: { id: 'x_123', first_name: 'Bob', last_name: 'Lee' },
    org: 'Org',
  },
  event: {
    kind: 'submitted',
    data: { submission_id: 'sub_12', kind: 'external_url' },
  },
};

export const docEventRequested = {
  timestamp: '2024-04-11T15:22:06.938697Z',
  actor: {
    user: { id: 'x_124', first_name: 'Bob', last_name: 'Lee' },
    org: 'Org B',
  },
  event: {
    kind: 'requested',
    data: {
      template_id: 'cdt_SBJ',
      name: 'Anti-Money Laundering Policy',
      description: 'Do the right thing!',
    },
  },
};

export const docEventReviewedAccepted = {
  timestamp: '2024-04-11T15:28:38.552594Z',
  actor: {
    user: { id: 'x_125', first_name: 'Bob', last_name: 'Lee' },
    org: 'Org C',
  },
  event: {
    kind: 'reviewed',
    data: { decision: 'accepted', note: 'Nice' },
  },
};

export const docEventAssigned = {
  timestamp: '2024-04-12T09:29:47.196787Z',
  actor: {
    user: { id: 'x_126', first_name: 'Bob', last_name: 'Lee' },
    org: 'Org D',
  },
  event: {
    kind: 'assigned',
    data: {
      kind: 'partner_tenant',
      assigned_to: {
        user: { id: 'x_127', first_name: 'Alex', last_name: 'Sasha' },
        org: 'Org E',
      },
    },
  },
};
