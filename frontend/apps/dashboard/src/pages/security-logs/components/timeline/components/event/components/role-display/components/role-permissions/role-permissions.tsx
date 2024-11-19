import { IcoUser16 } from '@onefootprint/icons';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import type { CollectedDataOption } from '@onefootprint/request-types/dashboard';
import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useGetRoleText from './hooks/use-get-role-text';

type RolePermissionsProps = {
  scopes: TenantScope[];
  name: string;
};

const RolePermissions = ({ scopes, name }: RolePermissionsProps) => {
  const getRoleText = useGetRoleText();
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  // In its current state, we have many scopes that represent a decryption, typically one for each DI.
  // For example: [{kind: "decrypt", data: "name"}, {kind: "decrypt", data: "email"}, {kind: "decrypt", data: "phone_number"}]
  // In our case, we just want to display "Decrypt data" for now, possibly later we'll add this functionality
  // The logic below gets rid of the individual scopes and just displays "Decrypt data"
  const canDecrypt = scopes.some(scope => scope.kind === 'decrypt');
  const roleScopesWithoutDecrypt = scopes.filter(scope => scope.kind !== 'decrypt');
  const scopesTextWithoutDecrypt = roleScopesWithoutDecrypt.map(scope => getRoleText(scope as TenantScope));
  const scopesTextWithDecrypt = canDecrypt
    ? scopesTextWithoutDecrypt.concat(getRoleText({ kind: 'decrypt', data: 'data' as CollectedDataOption }))
    : scopesTextWithoutDecrypt;

  return (
    <ShadowStack
      direction="column"
      gap={6}
      borderColor="tertiary"
      padding={5}
      borderWidth={1}
      borderStyle="solid"
      borderRadius="default"
      backgroundColor="primary"
      width={scopesTextWithDecrypt.length > 1 ? '413px' : '212px'}
    >
      <Stack gap={2} align="center">
        <IcoUser16 />
        <Text variant="label-3">{`"${name}" ${t('role-permissions')}`}</Text>
      </Stack>
      <Box
        display="grid"
        gridTemplateColumns={scopesTextWithDecrypt.length > 2 ? 'repeat(2, minmax(0, 190px))' : '190px'}
        justifyContent="space-between"
        gap={9}
        rowGap={4}
      >
        {scopesTextWithDecrypt.map(scopeText => (
          <Text variant="body-3">{scopeText}</Text>
        ))}
      </Box>
    </ShadowStack>
  );
};

const ShadowStack = styled(Stack)`
    box-shadow: 0px 1px 8px 0px #00000024;
`;

export default RolePermissions;
