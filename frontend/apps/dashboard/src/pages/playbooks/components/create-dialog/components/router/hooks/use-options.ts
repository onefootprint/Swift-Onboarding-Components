import { useTranslation } from 'react-i18next';

import { OnboardingTemplate, PlaybookKind } from '@/playbooks/utils/machine/types';

type UseOptionsProps = {
  template?: OnboardingTemplate;
};

const useOptions = ({ template }: UseOptionsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks.dialog' });

  const createAuthOptions = () => {
    return [
      {
        value: 'whoToOnboard',
        label: t('who-to-onboard.nav'),
        options: [{ value: 'residency', label: t('residency.nav') }],
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'dataToCollect', label: t('data-to-collect.nav') },
    ];
  };

  const createKybOptions = () => {
    return [
      { value: 'whoToOnboard', label: t('who-to-onboard.nav') },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'dataToCollect', label: t('data-to-collect.nav') },
      { value: 'verificationChecks', label: t('verification-checks.nav') },
    ];
  };

  const createKycOptions = () => {
    const canEdit = template !== OnboardingTemplate.Apex && template !== OnboardingTemplate.Alpaca;

    const options = [
      {
        value: 'whoToOnboard',
        label: t('who-to-onboard.nav'),
        options: [
          {
            value: 'onboardingTemplates',
            label: t('onboarding-templates.nav'),
          },
        ],
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'dataToCollect', label: t('data-to-collect.nav') },
    ];
    if (canEdit) {
      const [first] = options;
      first.options?.push({
        value: 'residency',
        label: t('residency.nav'),
      });
      options.push({
        value: 'verificationChecks',
        label: t('verification-checks.nav'),
      });
    }
    return options;
  };

  const createDocOptions = () => {
    return [
      {
        value: 'whoToOnboard',
        label: t('who-to-onboard.nav'),
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'dataToCollect', label: t('data-to-collect.nav') },
    ];
  };

  const createUnknownOptions = () => {
    return [
      { value: 'whoToOnboard', label: t('who-to-onboard.nav') },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'dataToCollect', label: t('data-to-collect.nav') },
      { value: 'verificationChecks', label: t('verification-checks.nav') },
    ];
  };

  return {
    [PlaybookKind.Auth]: createAuthOptions(),
    [PlaybookKind.Kyb]: createKybOptions(),
    [PlaybookKind.Kyc]: createKycOptions(),
    [PlaybookKind.DocOnly]: createDocOptions(),
    [PlaybookKind.Unknown]: createUnknownOptions(),
  };
};

export default useOptions;
