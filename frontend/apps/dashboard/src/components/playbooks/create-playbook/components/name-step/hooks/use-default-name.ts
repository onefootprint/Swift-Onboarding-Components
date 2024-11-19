import type { ObConfigurationKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

const useDefaultName = ({ kind }: { kind: ObConfigurationKind }) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'kinds' });
  const {
    data: { org },
  } = useSession();
  const tenantName = org?.name || '';
  const dateString = new Date().toLocaleString('en-us', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  return `${tenantName} ${t(kind)} (${dateString})`;
};

export default useDefaultName;
