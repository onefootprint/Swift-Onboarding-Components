import { useTranslation } from '@onefootprint/hooks';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

const useOptions = () => {
  const { t } = useTranslation('pages.playbooks.dialog.router');
  const defaultOptions = [
    { value: 'whoToOnboard', label: t('who-to-onboard') },
    { value: 'nameYourPlaybook', label: t('name-your-playbook') },
    { value: 'summary', label: t('your-playbook') },
    { value: 'authorizedScopes', label: t('authorized-scopes') },
  ];
  const kycOptions = [
    {
      value: 'whoToOnboard',
      label: t('who-to-onboard'),
      options: [{ value: 'residency', label: 'Residency' }],
    },
    { value: 'nameYourPlaybook', label: t('name-your-playbook') },
    { value: 'summary', label: t('your-playbook') },
    { value: 'authorizedScopes', label: t('authorized-scopes') },
  ];
  const kybOptions = defaultOptions;

  return {
    [PlaybookKind.Unknown]: defaultOptions,
    [PlaybookKind.Kyc]: kycOptions,
    [PlaybookKind.Kyb]: kybOptions,
  };
};

export default useOptions;
