import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import type { StepperOption } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const useOptions = (playbook?: OnboardingConfiguration): StepperOption[] => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const isEditing = !!playbook;
  const options: StepperOption[] = [
    {
      label: t('name'),
      value: 'name',
    },
    {
      label: t('details'),
      value: 'details',
    },
  ];
  if (isEditing) {
    options.push({
      label: t('reviewChanges'),
      value: 'reviewChanges',
    });
  }
  return options;
};

export default useOptions;
