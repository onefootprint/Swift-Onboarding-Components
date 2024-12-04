import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';

export const oneFieldFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.first_name'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const twoFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.first_name', 'id.last_name'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const threeFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.first_name', 'id.last_name', 'id.dob'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const fourFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.first_name', 'id.last_name', 'id.dob', 'id.email'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const fiveFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.first_name', 'id.last_name', 'id.dob', 'id.email', 'id.phone_number'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const fifteenFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: [
      'id.first_name',
      'id.last_name',
      'id.dob',
      'id.email',
      'id.phone_number',
      'id.nationality',
      'id.country',
      'id.ssn4',
      'id.citizenships',
      'id.us_tax_id',
      'id.address_line1',
      'id.us_legal_status',
      'id.visa_expiration_date',
      'id.visa_kind',
      'id.zip',
    ],
    fpId: '1234',
    reason: 'Testing',
  },
});

// Financial data fixtures
export const onlyFinancialFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: [
      'card.*.issuer',
      'card.*.number_last4',
      'card.*.name',
      'bank.*.name',
      'bank.*.ach_routing_number',
    ],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const financialWithThreeFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['card.*.issuer', 'card.*.number_last4', 'bank.*.name', 'id.first_name', 'id.last_name', 'id.dob'],
    fpId: '1234',
    reason: 'Testing',
  },
});

export const financialWithManyFieldsFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: [
      'card.*.issuer',
      'card.*.number_last4',
      'bank.*.name',
      'id.first_name',
      'id.last_name',
      'id.dob',
      'id.email',
      'id.phone_number',
      'id.nationality',
    ],
    fpId: '1234',
    reason: 'Testing',
  },
});
