import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { format, formatDistance } from 'date-fns';

const Row = ({ accessRequest }: { accessRequest: AccessRequest }) => {
  const duration = formatDistance(new Date(accessRequest.createdAt), new Date(accessRequest.expiresAt), {
    addSuffix: false,
  });
  const expiresAt = format(new Date(accessRequest.expiresAt), 'MM/dd/yyyy');

  return (
    <>
      <p className="text-body-3 text-primary">{accessRequest.requester}</p>
      <p className="text-body-3 text-primary">PLACEHOLDER</p>
      <p className="text-body-3 text-primary">{`${duration} (Until ${expiresAt})`}</p>
      <p className="text-body-3 text-primary">PLACEHOLDER</p>
    </>
  );
};

export default Row;
