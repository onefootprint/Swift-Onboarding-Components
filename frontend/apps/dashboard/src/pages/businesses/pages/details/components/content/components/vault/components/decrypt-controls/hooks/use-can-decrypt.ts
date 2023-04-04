import { Entity, EntityStatus } from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';

const useCanDecrypt = (entity: Entity) => {
  const { scopes, isAdmin } = usePermissions();
  if (!entity.isPortable) {
    return true;
  }
  if (entity.status === EntityStatus.incomplete || !entity.onboarding) {
    return false;
  }
  if (isAdmin) {
    return true;
  }
  const { canAccessAttributes, canAccessPermissions } = entity.onboarding;
  if (canAccessAttributes.length === 0 || canAccessPermissions.length === 0) {
    return false;
  }
  return canAccessPermissions.some(scope => scopes.includes(scope));
};

export default useCanDecrypt;
