import { getAuditEvent, getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Event from './event';

describe('<Event />', () => {
  it('shows decryption event description when event is DecryptUserData', () => {
    const auditEvent = getAuditEvent({
      detail: getAuditEventDetail({
        kind: 'decrypt_user_data',
        data: {
          decryptedFields: ['document.passport.nationality', 'document.id_card.ref_number'],
          context: 'api',
          fpId: '01e5abc4-7769-4430-9331-33f085ea0e1f',
          reason: 'test reason',
        },
      }),
    });

    customRender(<Event auditEvent={auditEvent} />);
    const element = screen.getByText('decrypted');
    expect(element).toBeInTheDocument();
  });

  it('does not show decryption event description when event is not DecryptUserData', () => {
    customRender(<Event auditEvent={getAuditEvent({ detail: getAuditEventDetail({ kind: 'update_user_data' }) })} />);
    const element = screen.queryByText('decrypted');
    expect(element).not.toBeInTheDocument();
  });
});
