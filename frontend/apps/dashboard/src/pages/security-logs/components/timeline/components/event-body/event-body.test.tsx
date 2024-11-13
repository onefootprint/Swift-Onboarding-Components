import { getAuditEvent, getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import EventBody from './event-body';

describe('<EventBody />', () => {
  it('renders decryption reason when kind is DecryptUserData', () => {
    customRender(
      <EventBody
        auditEvent={getAuditEvent({
          detail: getAuditEventDetail({
            kind: 'decrypt_user_data',
          }),
        })}
      />,
    );
    const element = screen.getByLabelText('Decryption reason body');
    expect(element).toBeInTheDocument();
  });

  it('renders nothing for other kinds', () => {
    customRender(
      <EventBody
        auditEvent={getAuditEvent({
          detail: getAuditEventDetail({
            kind: 'disable_playbook',
          }),
        })}
      />,
    );
    expect(screen.queryByLabelText('Decryption reason body')).not.toBeInTheDocument();
  });
});
