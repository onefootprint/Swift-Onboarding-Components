type RolePermissionsProps = {
  scopes: string[];
};

const RolePermissions = ({ scopes }: RolePermissionsProps) => {
  return <div>{scopes.join(', ')}</div>;
};

export default RolePermissions;
