import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';

export const auditEventFixture = getAuditEventDetail({
  kind: 'decrypt_user_data',
  data: {
    context: 'api',
    decryptedFields: ['id.email'],
    fpId: 'fp_123',
    reason: 'Test reason',
  },
});
