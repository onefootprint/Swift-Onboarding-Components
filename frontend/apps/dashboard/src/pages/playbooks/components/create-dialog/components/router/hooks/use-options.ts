import { useTranslation } from '@onefootprint/hooks';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

const useOptions = () => {
  const { t } = useTranslation('pages.playbooks');

  const defaultOptions = [
    { value: 'whoToOnboard', label: t('dialog.who-to-onboard.nav') },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('dialog.summary.nav') },
    { value: 'authorizedScopes', label: t('dialog.authorized-scopes.nav') },
    { value: 'aml', label: t('dialog.aml.nav') },
  ];
  const kycOptions = [
    {
      value: 'whoToOnboard',
      label: t('dialog.who-to-onboard.nav'),
      options: [{ value: 'residency', label: t('dialog.residency.nav') }],
    },
    { value: 'nameYourPlaybook', label: t('dialog.name-your-playbook.nav') },
    { value: 'summary', label: t('dialog.summary.nav') },
    { value: 'authorizedScopes', label: t('dialog.authorized-scopes.nav') },
    { value: 'aml', label: t('dialog.aml.nav') },
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
  const kybOptions = defaultOptions;

  return {
    [PlaybookKind.Auth]: authOptions,
    [PlaybookKind.Kyb]: kybOptions,
    [PlaybookKind.Kyc]: kycOptions,
    [PlaybookKind.Unknown]: defaultOptions,
  };
};

export default useOptions;
