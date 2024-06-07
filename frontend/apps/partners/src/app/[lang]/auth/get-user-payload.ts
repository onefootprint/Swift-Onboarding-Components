import type { Session } from '@/hooks';
import type { OrgLoginResponse } from '@/queries';

const getUserPayload = (user: NonNullable<OrgLoginResponse['user']>): Session['user'] => ({
  id: String(user.id),
  email: String(user.email),
  firstName: user?.firstName || null,
  lastName: user?.lastName || null,
  isAssumedSession: false,
  isAssumedSessionEditMode: false,
  isFirmEmployee: user?.isFirmEmployee,
  /** @ts-expect-error: scopes is string vs enum */
  scopes: user?.role.scopes || [],
});

export default getUserPayload;
