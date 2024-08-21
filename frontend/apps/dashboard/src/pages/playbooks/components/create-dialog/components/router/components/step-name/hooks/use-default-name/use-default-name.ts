import usePlaybookKindText from '@/playbooks/hooks/use-playbook-kind-text';
import type { PlaybookKind } from '@/playbooks/utils/machine/types';
import useSession from 'src/hooks/use-session';

const useDefaultName = ({ kind }: { kind: PlaybookKind }) => {
  const t = usePlaybookKindText();
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
