import { IcoUser16 } from '@onefootprint/icons';
import type { AuditEventDetail, TenantScope } from '@onefootprint/request-types/dashboard';
import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useGetRoleText from '../../role-display/components/role-permissions/hooks/use-get-role-text';
import getScopeDiff from './utils/get-scope-diff';

const RoleDiff = ({ detail }: { detail: AuditEventDetail }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const getRoleText = useGetRoleText();
  if (detail.kind !== 'update_org_role') {
    return null;
  }
  const { prevScopes, newScopes, roleName } = detail.data;
  const { oldScopesRemoved, newScopesAdded, commonScopes } = getScopeDiff(prevScopes, newScopes);
  const commonScopesText = commonScopes.map(scope => getRoleText(scope as TenantScope));
  const oldScopesText = oldScopesRemoved.map(scope => getRoleText(scope as TenantScope));
  const newScopesText = newScopesAdded.map(scope => getRoleText(scope as TenantScope));

  return (
    <Stack
      padding={5}
      borderWidth={1}
      borderStyle="solid"
      borderColor="tertiary"
      borderRadius="default"
      gap={5}
      direction="column"
      backgroundColor="primary"
      width="475px"
    >
      <Stack gap={2} alignItems="center">
        <IcoUser16 />
        <Text variant="label-3">
          "{roleName}" {t('role-permissions')}
        </Text>
      </Stack>
      <Stack gap={4} direction="column">
        <Stack backgroundColor="secondary" padding={5} borderRadius="default" gap={4} direction="column">
          <Text variant="label-3">{t('new-permissions')}</Text>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, minmax(0, 190px))"
            justifyContent="space-between"
            gap={9}
            rowGap={4}
          >
            {commonScopesText.map(scopeText => (
              <Text key={scopeText} variant="body-3">
                {scopeText}
              </Text>
            ))}
            {newScopesText.map(scopeText => (
              <Text key={scopeText} variant="body-3" color="success">
                {scopeText} (+)
              </Text>
            ))}
          </Box>
        </Stack>
        <Stack backgroundColor="secondary" padding={5} borderRadius="default" gap={4} direction="column">
          <Text variant="label-3">{t('old-permissions')}</Text>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, minmax(0, 190px))"
            justifyContent="space-between"
            gap={9}
            rowGap={4}
          >
            {commonScopesText.map(scopeText => (
              <Text key={scopeText} variant="body-3">
                {scopeText}
              </Text>
            ))}
            {oldScopesText.map(scopeText => (
              <Text key={scopeText} variant="body-3" color="error">
                {scopeText} (-)
              </Text>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default RoleDiff;
