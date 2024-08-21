import { IcoCheckCircle16, IcoFaceid16, IcoFileText16, IcoLock16, IcoShield24, IcoUser16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';

type SecurityChecks = {
  accessControl: boolean;
  dataAccess: boolean;
  strongAuthentication: boolean;
  dataEndToEndEncryption: boolean;
};

type SecurityChecksProps = { securityChecks: SecurityChecks };
type CheckItemProps = {
  label: string;
  Icon: React.FC;
  value: boolean;
};

const CheckItem = ({ label, Icon, value }: CheckItemProps) => (
  <Stack gap={3} justify="space-between">
    <Stack align="center" gap={3}>
      <Icon />
      <Text variant="body-3">{label}</Text>
    </Stack>
    {value ? <IcoCheckCircle16 color="success" /> : <IcoCheckCircle16 color="error" />}
  </Stack>
);

const Checks = ({ securityChecks }: SecurityChecksProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'companies' });

  return (
    <Stack tag="section" direction="column" gap={7}>
      <Stack justify="space-between" align="center" tag="header">
        <Stack gap={2} align="center">
          <IcoShield24 />
          <Text variant="label-2">{t('data-security-checks')}</Text>
        </Stack>
      </Stack>
      <Stack gap={3} direction="column">
        <CheckItem
          Icon={IcoUser16}
          label={t('access-control-roles-set-and-enforced')}
          value={securityChecks.accessControl}
        />
        <CheckItem
          Icon={IcoFileText16}
          label={t('data-access-events-securely-published-to-immutable-log')}
          value={securityChecks.dataAccess}
        />
        <CheckItem
          Icon={IcoFaceid16}
          label={t('strong-authentication-flow-enforced-for-users')}
          value={securityChecks.strongAuthentication}
        />
        <CheckItem
          Icon={IcoLock16}
          label={t('data-is-end-to-end-encrypted')}
          value={securityChecks.dataEndToEndEncryption}
        />
      </Stack>
    </Stack>
  );
};

export default Checks;
