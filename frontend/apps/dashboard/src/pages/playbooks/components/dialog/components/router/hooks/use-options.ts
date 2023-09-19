import { useTranslation } from '@onefootprint/hooks';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

const useOptions = () => {
  const { t } = useTranslation('pages.playbooks.dialog');

  const defaultOptions = [
    { value: 'whoToOnboard', label: t('who-to-onboard.nav') },
    { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
    { value: 'summary', label: t('summary.nav') },
    { value: 'authorizedScopes', label: t('authorized-scopes.nav') },
    { value: 'aml', label: t('aml.nav') },
  ];
  const kycOptions = [
    {
      value: 'whoToOnboard',
      label: t('who-to-onboard.nav'),
      options: [{ value: 'residency', label: t('residency.nav') }],
    },
    { value: 'nameYourPlaybook', label: t('name-your-playbook.nav') },
    { value: 'summary', label: t('summary.nav') },
    { value: 'authorizedScopes', label: t('authorized-scopes.nav') },
    { value: 'aml', label: t('aml.nav') },
  ];
  const kybOptions = defaultOptions;

  return {
    [PlaybookKind.Unknown]: defaultOptions,
    [PlaybookKind.Kyc]: kycOptions,
    [PlaybookKind.Kyb]: kybOptions,
  };
};

export default useOptions;
