import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { Tooltip } from '@onefootprint/ui';
import { format, formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Actions from './components/actions';

const Row = ({ accessRequest }: { accessRequest: AccessRequest }) => {
  const { t } = useTranslation('roles', { keyPrefix: 'scopes' });
  const duration = formatDistance(new Date(accessRequest.createdAt), new Date(accessRequest.expiresAt), {
    addSuffix: false,
  });
  const expiresAt = format(new Date(accessRequest.expiresAt), 'MM/dd/yyyy');
  const permissibleAttributes = accessRequest.scopes.map(scope => scope.kind);
  const firstThree = permissibleAttributes.slice(0, 3).map(attr => t(attr));
  const remainingAttrs = permissibleAttributes.slice(3).map(attr => t(attr));
  const remaining = remainingAttrs.length;

  return (
    <>
      <td key="requester" className="text-body-3 text-primary">
        {accessRequest.requester}
      </td>
      <td key="scopes" className="text-body-3 text-primary">
        {firstThree.join(', ')}{' '}
        {remaining > 0 ? (
          <Tooltip text={remainingAttrs.join(', ')}>
            <span className="underline cursor-help">{`and ${remaining} more`}</span>
          </Tooltip>
        ) : (
          ''
        )}
      </td>
      <td key="duration" className="text-body-3 text-primary">{`${duration} (Until ${expiresAt})`}</td>
      <td key="actions" className="flex items-center justify-end">
        <Actions id={accessRequest.id} />
      </td>
    </>
  );
};

export default Row;
