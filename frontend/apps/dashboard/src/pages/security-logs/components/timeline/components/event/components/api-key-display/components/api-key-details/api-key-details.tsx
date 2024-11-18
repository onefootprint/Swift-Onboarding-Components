import { IcoKey16 } from '@onefootprint/icons';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useGetRoleText from '../../../role-display/components/role-permissions/hooks/use-get-role-text';

const ApiKeyDetails = ({ name, scopes, roleName }: { name: string; scopes: TenantScope[]; roleName: string }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });
  const getRoleText = useGetRoleText();
  const roleText = scopes.map(scope => getRoleText(scope as TenantScope));
  return (
    <Stack
      direction="column"
      gap={5}
      padding={4}
      backgroundColor="primary"
      borderRadius="default"
      borderColor="primary"
      borderWidth={1}
      borderStyle="solid"
    >
      <Stack gap={1}>
        <IcoKey16 /> <Text variant="label-3">{t('api-key-details')}</Text>
      </Stack>
      <Stack direction="column" gap={4}>
        <Stack gap={9}>
          <Stack gap={2} direction="column" width="180px">
            <Text variant="body-3" color="tertiary">
              {t('name')}
            </Text>
            <Text variant="body-3">{name}</Text>
          </Stack>
          <Stack gap={2} direction="column">
            <Text variant="body-3" color="tertiary">
              {t('role')}
            </Text>
            <Text variant="body-3">{roleName}</Text>
          </Stack>
        </Stack>
        <Divider variant="secondary" />
        <Stack
          paddingInline={4}
          paddingBlock={3}
          backgroundColor="secondary"
          borderRadius="default"
          gap={4}
          direction="column"
        >
          <Text variant="label-3">{t('permissions')}</Text>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, minmax(0, 190px))"
            justifyContent="space-between"
            gap={9}
            rowGap={3}
          >
            {roleText.map(text => (
              <Text variant="body-3">{text}</Text>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ApiKeyDetails;
