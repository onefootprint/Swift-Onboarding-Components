import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

type FinancialPermissionsProps = {
  title: string;
  permissions: DataIdentifier[];
};

const FinancialPermissions = ({ title, permissions }: FinancialPermissionsProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data.financial' });
  return (
    <div className="flex flex-col gap-3 p-3 px-4 rounded bg-secondary">
      <h3 className="text-label-3">{title}</h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {permissions.map(permission => (
          <div key={permission} className="text-body-3">
            {t(permission)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPermissions;
