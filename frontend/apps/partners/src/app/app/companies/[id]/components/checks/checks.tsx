import {
  IcoCheckCircle16,
  IcoFaceid16,
  IcoFileText16,
  IcoLock16,
  IcoShield24,
  IcoUser16,
} from '@onefootprint/icons';
import { Button, Stack, Text } from '@onefootprint/ui';
import React from 'react';

import type { SecurityChecks } from '@/config/types';

type SecurityChecksProps = {
  securityChecks: SecurityChecks;
};

const Checks = ({ securityChecks }: SecurityChecksProps) => (
  <Stack tag="section" direction="column" gap={7}>
    <Stack justify="space-between" align="center" tag="header">
      <Stack gap={2} align="center">
        <IcoShield24 />
        <Text variant="label-2">Data security checks</Text>
      </Stack>
      <Button variant="secondary" size="compact">
        Download report
      </Button>
    </Stack>
    <Stack gap={3} direction="column">
      <CheckItem
        Icon={IcoUser16}
        label="Access control roles set and enforced"
        value={securityChecks.accessControl}
      />
      <CheckItem
        Icon={IcoFileText16}
        label="Data access events securely published to immutable log"
        value={securityChecks.dataAccess}
      />
      <CheckItem
        Icon={IcoFaceid16}
        label="Strong authentication flow enforced for users"
        value={securityChecks.strongAuthentication}
      />
      <CheckItem
        Icon={IcoLock16}
        label="Data is end-to-end encrypted"
        value={securityChecks.dataEndToEndEncryption}
      />
    </Stack>
  </Stack>
);

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
    {value ? (
      <IcoCheckCircle16 color="success" />
    ) : (
      <IcoCheckCircle16 color="error" />
    )}
  </Stack>
);

export default Checks;
