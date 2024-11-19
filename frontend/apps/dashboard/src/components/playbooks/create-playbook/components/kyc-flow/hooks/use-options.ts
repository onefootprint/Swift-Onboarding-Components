import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useOptions = (playbook?: OnboardingConfiguration) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const options = [
    { label: t('name'), value: 'name' },
    { label: t('templates'), value: 'templates' },
    {
      label: t('details'),
      value: 'details',
      options: [
        { label: t('residency'), value: 'residency' },
        { label: t('personal'), value: 'kycData' },
        { label: t('otp'), value: 'requiredAuthMethods' },
      ],
    },
    { label: t('verification-checks'), value: 'verificationChecks' },
    { label: t('review-changes'), value: 'reviewChanges' },
  ];
  if (playbook) {
    return options.filter(option => option.value !== 'templates');
  }
  return options.filter(option => option.value !== 'reviewChanges');
};

export default useOptions;
