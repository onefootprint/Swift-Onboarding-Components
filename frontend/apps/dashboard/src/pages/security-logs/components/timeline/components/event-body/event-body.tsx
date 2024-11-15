import type { AuditEvent, AuditEventDetail } from '@onefootprint/request-types/dashboard';
import DecryptionReason from './components/decryption-reason';

type EventBodyProps = {
  auditEvent: AuditEvent;
  showDecryptionReason: boolean;
};

const EventBody = ({ auditEvent, showDecryptionReason }: EventBodyProps) => {
  const { detail } = auditEvent;
  const { kind } = detail;

  if (!showDecryptionReason) {
    return null;
  }

  if (kind === 'decrypt_user_data') {
    return <DecryptionReason detail={detail as AuditEventDetail} />;
  }
  return null;
};

export default EventBody;
