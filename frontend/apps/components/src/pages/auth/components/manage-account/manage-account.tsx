import type { T } from '@onefootprint/hooks';
import { useTranslation } from '@onefootprint/hooks';
import type { ComponentProps } from 'react';
import React from 'react';

import ManageAccountComponent from './component';

type Texts = ManageAccountComponentProps['texts'];
type ManageAccountProps = Pick<
  ManageAccountComponentProps,
  'children' | 'Header'
>;
type ManageAccountComponentProps = ComponentProps<
  typeof ManageAccountComponent
>;

const getRegisterFlowTexts = (t: T): Texts => ({
  addDevice: t('add-device'),
  change: t('change'),
  cta: t('skip-and-finish'),
  deviceAdded: t('device-added'),
  headerSubtitle: t('enhance-security-advice'),
  headerTitle: t('additional-verifications'),
  verified: t('verified'),
  verify: t('verify'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getEditFlowTexts = (t: T): Texts => ({
  addDevice: t('add-device'),
  change: t('change'),
  cta: t('save-changes'),
  deviceAdded: t('device-added'),
  headerSubtitle: t('edit-details-in-account'),
  headerTitle: t('revise-auth-details'),
  verified: t('verified'),
  verify: t('verify'),
});

const ManageAccount = ({ children, Header }: ManageAccountProps) => {
  const { t } = useTranslation('pages.auth');

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
      texts={getRegisterFlowTexts(t)}
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
