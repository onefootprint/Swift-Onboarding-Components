import { useTranslation } from 'react-i18next';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

const useOptions = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks' });

  const defaultOptions = [
    { value: 'whoToOnboard', label: t('dialog.who-to-onboard.nav') },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('dialog.summary.nav') },
    { value: 'verificationChecks', label: t('dialog.verification-checks.nav') },
  ];
  const kycOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
      options: [{ value: 'residency', label: t('dialog.residency.nav') }],
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('dialog.summary.nav') },
    { value: 'verificationChecks', label: t('dialog.verification-checks.nav') },
  ];
  const authOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
      options: [{ value: 'residency', label: t('dialog.residency.nav') }],
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('details.title') },
  ];
  const docOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('dialog.summary.nav') },
  ];
  const kybOptions = defaultOptions;

  return {
    [PlaybookKind.Auth]: authOptions,
    [PlaybookKind.Kyb]: kybOptions,
    [PlaybookKind.Kyc]: kycOptions,
    [PlaybookKind.IdDoc]: docOptions,
    [PlaybookKind.Unknown]: defaultOptions,
  };
};

export default useOptions;
