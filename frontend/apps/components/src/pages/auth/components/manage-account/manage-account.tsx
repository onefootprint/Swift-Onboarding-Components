import type { ComponentProps } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ManageAccountComponent from './component';

type ManageAccountProps = Pick<
  ManageAccountComponentProps,
  'children' | 'Header'
>;
type ManageAccountComponentProps = ComponentProps<
  typeof ManageAccountComponent
>;

const ManageAccount = ({ children, Header }: ManageAccountProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth',
  });

  const getRegisterFlowTexts = () => ({
    addDevice: t('add-device'),
    change: t('change'),
    cta: t('skip-and-finish'),
    deviceAdded: t('device-added'),
    headerSubtitle: t('enhance-security-advice'),
    headerTitle: t('additional-verifications'),
    verified: t('verified'),
    verify: t('verify'),
  });

  return (
    <ManageAccountComponent
      Header={Header}
      entryEmail={{
        label: 'j••••••••@g•••.com',
        status: 'verified',
        onClick: console.log, // eslint-disable-line no-console
      }}
      entryPasskey={{
        label: 'Passkey · iPhone 15 Pro',
        status: 'unverified',
        onClick: console.log, // eslint-disable-line no-console
      }}
      entryPhone={{
        label: '(•••) ••• ••02',
        status: 'unverified',
        onClick: console.log, // eslint-disable-line no-console
      }}
      texts={getRegisterFlowTexts()}
      cta={{
        isLoading: false,
        onClick: console.log, // eslint-disable-line no-console
        variant: 'secondary',
      }}
    >
      {children}
    </ManageAccountComponent>
  );
};

export default ManageAccount;
