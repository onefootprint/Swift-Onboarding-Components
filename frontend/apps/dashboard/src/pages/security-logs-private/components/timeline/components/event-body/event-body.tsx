import { type AccessEvent, AccessEventKind, type DecryptUserDataDetail } from '@onefootprint/types';
import DecryptionReason from './components/decryption-reason';

type EventBodyProps = {
  accessEvent: AccessEvent;
};

const EventBody = ({ accessEvent }: EventBodyProps) => {
  const { detail } = accessEvent;
  const { kind } = detail;

  if (kind === AccessEventKind.DecryptUserData) {
    return <DecryptionReason detail={detail as DecryptUserDataDetail} />;
  }
  return null;
};

export default EventBody;
