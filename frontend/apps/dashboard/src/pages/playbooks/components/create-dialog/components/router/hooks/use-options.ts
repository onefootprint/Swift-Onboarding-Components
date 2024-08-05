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
        value: 'kind',
        label: t('who-to-onboard.nav'),
        options: [{ value: 'residency', label: t('residency.nav') }],
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'settingsAuth', label: t('data-to-collect.nav') },
    ];
  };

  const createKybOptions = () => {
    return [
      { value: 'kind', label: t('who-to-onboard.nav') },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      {
        value: 'settingsKyb',
        label: t('data-to-collect.nav'),
        options: [
          { value: 'settingsBusiness', label: t('data-to-collect.business-nav') },
          { value: 'settingsBo', label: t('data-to-collect.bo-nav') },
          { value: 'otpVerifications', label: t('data-to-collect.otp-verifications-nav') },
        ],
      },
      { value: 'verificationChecks', label: t('verification-checks.nav') },
    ];
  };

  const createKycOptions = () => {
    const options = [
      {
        value: 'kind',
        label: t('who-to-onboard.nav'),
        options: [
          {
            value: 'onboardingTemplates',
            label: t('onboarding-templates.nav'),
          },
        ],
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      {
        value: 'settingsKyc',
        label: t('data-to-collect.nav'),
        options: [
          { value: 'personalInfo', label: t('data-to-collect.personal-info-nav') },
          { value: 'otpVerifications', label: t('data-to-collect.otp-verifications-nav') },
        ],
      },
    ];
    const canEdit = template !== OnboardingTemplate.Apex && template !== OnboardingTemplate.Alpaca;
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

  const createDocOnlyOptions = () => {
    return [
      {
        value: 'kind',
        label: t('who-to-onboard.nav'),
      },
      { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
      { value: 'settingsDocOnly', label: t('data-to-collect.nav') },
    ];
  };

  return {
    [PlaybookKind.Auth]: createAuthOptions(),
    [PlaybookKind.DocOnly]: createDocOnlyOptions(),
    [PlaybookKind.Kyb]: createKybOptions(),
    [PlaybookKind.Kyc]: createKycOptions(),
    [PlaybookKind.Unknown]: createKycOptions(),
  };
};

export default useOptions;
