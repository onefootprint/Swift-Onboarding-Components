import { type AccessEvent, AccessEventKind } from '@onefootprint/types';
import DecryptionReason from './components/decryption-reason';

type EventBodyProps = {
  accessEvent: AccessEvent;
};

const EventBody = ({ accessEvent }: EventBodyProps) => {
  const { detail } = accessEvent;
  const { kind } = detail;

  if (kind === AccessEventKind.DecryptUserData) {
    return <DecryptionReason detail={detail} />;
  }
  return null;
};

export default EventBody;
