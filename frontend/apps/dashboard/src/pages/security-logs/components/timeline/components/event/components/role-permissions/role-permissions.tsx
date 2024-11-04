import { type Role, RoleScopeKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useGetRoleText from './hooks/use-get-role-text/use-get-role-text';

type RolePermissionsProps = {
  role: Role;
};

const RolePermissions = ({ role }: RolePermissionsProps) => {
  const getRoleText = useGetRoleText();
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const { scopes, name } = role;
  // In its current state, we have many scopes that represent a decryption, typically one for each DI.
  // For example: [{kind: "decrypt", data: "name"}, {kind: "decrypt", data: "email"}, {kind: "decrypt", data: "phone_number"}]
  // In our case, we just want to display "Decrypt data" for now, possibly later we'll add this functionality
  // The logic below gets rid of the individual scopes and just displays "Decrypt data"
  const canDecrypt = role.scopes.some(scope => scope.kind === RoleScopeKind.decrypt);
  const roleScopesWithoutDecrypt = scopes.filter(scope => scope.kind !== RoleScopeKind.decrypt);
  const scopesTextWithoutDecrypt = roleScopesWithoutDecrypt.map(scope => getRoleText(scope));
  const scopesTextWithDecrypt = canDecrypt
    ? scopesTextWithoutDecrypt.concat(getRoleText({ kind: RoleScopeKind.decrypt, data: 'data' }))
    : scopesTextWithoutDecrypt;

  // Divide into two columns
  const midpoint = Math.ceil(scopesTextWithDecrypt.length / 2);
  const firstHalf = scopesTextWithDecrypt.slice(0, midpoint);
  const secondHalf = scopesTextWithDecrypt.slice(midpoint);

  return (
    <Stack
      direction="column"
      gap={6}
      borderColor="tertiary"
      padding={5}
      borderWidth={1}
      borderStyle="solid"
      borderRadius="default"
      width={scopesTextWithDecrypt.length > 1 ? '413px' : '212px'}
    >
      <Text variant="label-3">{`"${name}" ${t('role-permissions')}`}</Text>
      <Stack justifyContent="space-between">
        <Stack direction="column" gap={3}>
          {firstHalf.map(scopeText => (
            <Text variant="body-3">{scopeText}</Text>
          ))}
        </Stack>
        <Stack direction="column" gap={3}>
          {secondHalf.map(scopeText => (
            <Text variant="body-3">{scopeText}</Text>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default RolePermissions;
