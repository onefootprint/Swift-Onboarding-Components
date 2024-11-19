import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import usePlaybookKindText from 'src/hooks/use-playbook-kind-text';

const useTitle = (playbook?: OnboardingConfiguration) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create' });
  const kindT = usePlaybookKindText();

  if (playbook) {
    return t('title.edit', {
      name: playbook.name,
      kind: kindT(playbook.kind),
    });
  }
  return t('title.new');
};

export default useTitle;
