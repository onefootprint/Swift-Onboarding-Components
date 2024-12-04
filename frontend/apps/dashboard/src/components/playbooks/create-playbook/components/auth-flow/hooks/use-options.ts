import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useOptions = (playbook?: OnboardingConfiguration) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const options = [
    { label: t('name'), value: 'name' },
    { label: t('details'), value: 'details' },
  ];
  if (playbook) {
    return [...options, { label: t('review-changes'), value: 'reviewChanges' }];
  }
  return options;
};

export default useOptions;
