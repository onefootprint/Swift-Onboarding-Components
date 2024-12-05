import type { TenantScope } from '@onefootprint/request-types/dashboard';
import type { CollectedDataOption } from '@onefootprint/request-types/dashboard';
import useGetRoleText from './hooks/use-get-role-text';

type RolePermissionsProps = {
  scopes: TenantScope[];
  name: string;
};

const RolePermissions = ({ scopes }: RolePermissionsProps) => {
  const getRoleText = useGetRoleText();
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
    <div className="flex flex-col items-start gap-3">
      <div className="grid justify-between grid-cols-2 gap-5 gap-y-3">
        {scopesTextWithDecrypt.map(scopeText => (
          <div key={scopeText} className="text-body-3">
            {scopeText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;
