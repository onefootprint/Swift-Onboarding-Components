import { useTranslation } from 'react-i18next';

import { OnboardingTemplate, PlaybookKind } from '@/playbooks/utils/machine/types';

type UseOptionsProps = {
  template?: OnboardingTemplate;
};

const useOptions = ({ template }: UseOptionsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks' });
  const isEditableKycTemplate = template !== OnboardingTemplate.Apex && template !== OnboardingTemplate.Alpaca;

  const defaultOptions = [
    { value: 'whoToOnboard', label: t('dialog.who-to-onboard.nav') },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'dataToCollect', label: t('dialog.data-to-collect.nav') },
    { value: 'verificationChecks', label: t('dialog.verification-checks.nav') },
  ];
  const kycOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
      options: [
        {
          value: 'onboardingTemplates',
          label: t('dialog.onboarding-templates.nav'),
        },
      ],
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'dataToCollect', label: t('dialog.data-to-collect.nav') },
  ];
  if (isEditableKycTemplate) {
    kycOptions[0].options?.push({
      value: 'residency',
      label: t('dialog.residency.nav'),
    });
    kycOptions.push({
      value: 'verificationChecks',
      label: t('dialog.verification-checks.nav'),
    });
  }
  const authOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
      options: [{ value: 'residency', label: t('dialog.residency.nav') }],
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'dataToCollect', label: t('details.title') },
  ];
  const docOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'dataToCollect', label: t('dialog.data-to-collect.nav') },
  ];
  const kybOptions = defaultOptions;

  return {
    [PlaybookKind.Auth]: authOptions,
    [PlaybookKind.Kyb]: kybOptions,
    [PlaybookKind.Kyc]: kycOptions,
    [PlaybookKind.DocOnly]: docOptions,
    [PlaybookKind.Unknown]: defaultOptions,
  };
};

export default useOptions;
