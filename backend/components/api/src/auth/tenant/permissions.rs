use super::{CanCheckTenantPermissions, IsPermissionMet, TenantAuth};
use crate::auth::Either;
use newtypes::{DataLifetimeKind, TenantPermission};
use std::collections::HashSet;
use std::fmt;

/// Represents a permission that is met if either its Left or Right permission is met
pub struct Or<Left, Right>(pub(crate) Left, pub(crate) Right);

impl<Left, Right> fmt::Display for Or<Left, Right>
where
    Left: IsPermissionMet,
    Right: IsPermissionMet,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Or<{},{}>", self.0, self.1)
    }
}

impl<Left, Right> IsPermissionMet for Or<Left, Right>
where
    Left: IsPermissionMet,
    Right: IsPermissionMet,
{
    fn is_met(self, token_scopes: &[TenantPermission]) -> bool {
        self.0.is_met(token_scopes) || self.1.is_met(token_scopes)
    }
}

/// Represents a permisison that is always met, no matter the scopes of the tenant auth token
pub struct Any;

impl fmt::Display for Any {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Any")
    }
}

impl IsPermissionMet for Any {
    fn is_met(self, _token_scopes: &[TenantPermission]) -> bool {
        true
    }
}

/// Represents a permission that is only met when the tenant auth token contains a scope that allows
/// decrypting the provided attributes
pub struct CanDecrypt(Vec<DataLifetimeKind>);

impl CanDecrypt {
    pub fn new(l: Vec<DataLifetimeKind>) -> Self {
        Self(l)
    }

    pub fn single(k: DataLifetimeKind) -> Self {
        Self(vec![k])
    }
}

impl fmt::Display for CanDecrypt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "CanDecrypt<{:?}>", self.0)
    }
}

impl IsPermissionMet for CanDecrypt {
    fn is_met(self, token_scopes: &[TenantPermission]) -> bool {
        let can_access: HashSet<_> = token_scopes
            .iter()
            .filter_map(|p| match p {
                TenantPermission::Decrypt { attributes } => Some(attributes),
                _ => None,
            })
            .flatten()
            .flat_map(|cdo| cdo.attributes())
            .collect();
        can_access.is_superset(&HashSet::from_iter(self.0.into_iter()))
    }
}

impl IsPermissionMet for TenantPermission {
    fn is_met(self, token_scopes: &[TenantPermission]) -> bool {
        match self {
            // TODO it's weird to specify the request decryption in terms of CollectedDataOptions here
            // since we could only be requesting a specific attribute. Maybe we just map the attributes
            // to the minimal owning option?
            // Or we make a new DecryptTenantPermissions struct of attributes and just don't impl
            // this trait for Self::Decrypt
            Self::Decrypt { .. } => {
                // Should instead us TenantDecryptPermission
                unimplemented!("Shouldn't reach here");
            }
            // Check if the permissions on the auth token contain this permission
            s => token_scopes.contains(&s),
        }
    }
}

impl<A, B> CanCheckTenantPermissions for Either<A, B>
where
    A: CanCheckTenantPermissions,
    B: CanCheckTenantPermissions,
{
    fn token_scopes(&self) -> &[newtypes::TenantPermission] {
        match self {
            Either::Left(l) => l.token_scopes(),
            Either::Right(r) => r.token_scopes(),
        }
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        match self {
            Either::Left(l) => l.tenant_auth(),
            Either::Right(r) => r.tenant_auth(),
        }
    }
}

// TODO unit tests
#[cfg(test)]
mod test {
    use super::{Any, CanDecrypt};
    use crate::auth::tenant::IsPermissionMet;
    use newtypes::{DataLifetimeKind, TenantPermission};
    use test_case::test_case;

    #[test_case(TenantPermission::Users.or_admin() => "Or<Users,Admin>")]
    #[test_case(CanDecrypt(vec![DataLifetimeKind::Ssn9, DataLifetimeKind::FirstName]).or(TenantPermission::ApiKeys) => "Or<CanDecrypt<[Ssn9, FirstName]>,ApiKeys>")]
    #[test_case(Any.or_admin() => "Or<Any,Admin>")]
    fn test_display<T: IsPermissionMet>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        format!("{}", t)
    }
}
