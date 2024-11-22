import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FinancialPermissionsProps = {
  title: string;
  permissions: DataIdentifier[];
};

const FinancialPermissions = ({ title, permissions }: FinancialPermissionsProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data.financial' });
  return (
    <Stack backgroundColor="secondary" paddingInline={4} paddingBlock={3} gap={5} direction="column">
      <Stack gap={2}>
        <Text variant="label-3">{title}</Text>
        <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 190px))" gap={9} rowGap={4}>
          {permissions.map(permission => (
            <Text variant="body-3">{t(permission)}</Text>
          ))}
        </Box>
      </Stack>
    </Stack>
  );
};

export default FinancialPermissions;
