import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useTabOptions = (playbook: OnboardingConfiguration, hideSettings: boolean) => {
  const { t } = useTranslation('playbook-details');

  const options =
    playbook.kind === 'document'
      ? [
          { value: 'data', label: t('tabs.data-collection') },
          { value: 'rules', label: t('tabs.rules') },
        ]
      : [
          { value: 'data', label: t('tabs.data-collection') },
          { value: 'verification-checks', label: t('tabs.verification-checks') },
          { value: 'rules', label: t('tabs.rules') },
          ...(hideSettings ? [] : [{ value: 'settings', label: t('tabs.settings') }]),
          { value: 'information', label: t('tabs.information') },
        ];

  return options;
};

export default useTabOptions;
