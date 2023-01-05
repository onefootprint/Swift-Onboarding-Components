use super::{CanCheckTenantPermissions, IsPermissionMet, TenantAuth};
use crate::auth::Either;
use newtypes::{DataLifetimeKind, TenantScope};
use std::collections::HashSet;
use std::fmt;
use strum::Display;

/// Represents a simple permission that is required to execute an HTTP handler.
/// We don't use TenantScope to represent permissions required by an HTTP handler because some
/// scopes give access to more than one permission, like Decrypt.
#[derive(Display)]
pub enum TenantPermission {
    Admin,
    OnboardingConfiguration,
    ApiKeys,
    OrgSettings,
    Users,
    DecryptCustom,
    ManualReview,
}

impl TenantPermission {
    /// Maps a TenantPermission to the TenantScope that grants this permission
    fn granting_scope(&self) -> TenantScope {
        match self {
            Self::Admin => TenantScope::Admin,
            Self::OnboardingConfiguration => TenantScope::OnboardingConfiguration,
            Self::ApiKeys => TenantScope::ApiKeys,
            Self::OrgSettings => TenantScope::OrgSettings,
            Self::Users => TenantScope::Users,
            Self::DecryptCustom => TenantScope::DecryptCustom,
            Self::ManualReview => TenantScope::ManualReview,
        }
    }
}

impl IsPermissionMet for TenantPermission {
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        token_scopes.contains(&self.granting_scope())
    }
}

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
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
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
    fn is_met(self, _token_scopes: &[TenantScope]) -> bool {
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
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        let can_access: HashSet<_> = token_scopes
            .iter()
            .filter_map(|p| match p {
                TenantScope::Decrypt(attributes) => Some(attributes),
                _ => None,
            })
            .flatten()
            .flat_map(|cdo| cdo.attributes())
            .collect();
        can_access.is_superset(&HashSet::from_iter(self.0.into_iter()))
    }
}

impl<A, B> CanCheckTenantPermissions for Either<A, B>
where
    A: CanCheckTenantPermissions,
    B: CanCheckTenantPermissions,
{
    fn token_scopes(&self) -> &[newtypes::TenantScope] {
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
    use super::{Any, CanDecrypt, TenantPermission as TP};
    use crate::auth::tenant::IsPermissionMet;
    use newtypes::{CollectedDataOption as CDO, DataLifetimeKind as DLK, TenantScope as TS};
    use test_case::test_case;
    //
    // Basic TenantPermission enum
    //
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TP::Users => false)]
    #[test_case(&[TS::OnboardingConfiguration], TP::ApiKeys => false)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TP::ApiKeys => true)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TP::OnboardingConfiguration => true)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TP::DecryptCustom => false)]
    #[test_case(&[], TP::OnboardingConfiguration => false)]
    //
    // Test CanDecrypt
    //
    #[test_case(&[TS::ApiKeys], CanDecrypt(vec![DLK::Ssn9]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name]), TS::Decrypt(vec![CDO::FullAddress]), TS::Users], CanDecrypt(vec![DLK::FirstName, DLK::City]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt(vec![DLK::Ssn9]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt(vec![DLK::Ssn4]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt(vec![DLK::Ssn4, DLK::FirstName]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name])], CanDecrypt(vec![DLK::Ssn4]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name, CDO::FullAddress])], CanDecrypt(vec![DLK::FirstName, DLK::Zip]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name, CDO::FullAddress])], CanDecrypt(vec![DLK::FirstName, DLK::Email]) => false)]
    #[test_case(&[TS::Decrypt(vec![])], CanDecrypt(vec![DLK::FirstName]) => false)]
    //
    // Test Or
    //
    #[test_case(&[TS::OnboardingConfiguration], TP::OnboardingConfiguration.or(TP::Admin) => true)]
    #[test_case(&[TS::OnboardingConfiguration], TP::Admin.or(TP::OnboardingConfiguration) => true)]
    #[test_case(&[TS::Admin], TP::OnboardingConfiguration.or_admin() => true)]
    #[test_case(&[TS::Admin], CanDecrypt(vec![DLK::Ssn9, DLK::FirstName, DLK::Email]).or_admin() => true)]
    #[test_case(&[TS::OnboardingConfiguration], TP::Users.or_admin() => false)]
    #[test_case(&[TS::OnboardingConfiguration], TP::Users.or(TP::ApiKeys).or(TP::OrgSettings) => false)]
    #[test_case(&[TS::Users], TP::Users.or(TP::ApiKeys).or(TP::OrgSettings) => true)]
    #[test_case(&[TS::ApiKeys], TP::Users.or(TP::ApiKeys).or(TP::OrgSettings) => true)]
    #[test_case(&[TS::OrgSettings], TP::Users.or(TP::ApiKeys).or(TP::OrgSettings) => true)]
    //
    // Test Any
    //
    #[test_case(&[TS::ApiKeys], Any => true)]
    #[test_case(&[], Any => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], Any => true)]
    /// Test that the token_scopes associated with an authentication method gives access to perform
    /// the requested_permission
    fn test_is_permission_met<T: IsPermissionMet>(token_scopes: &[TS], requested_permission: T) -> bool {
        requested_permission.is_met(token_scopes)
    }

    #[test_case(TP::Users.or_admin() => "Or<Users,Admin>")]
    #[test_case(CanDecrypt(vec![DLK::Ssn9, DLK::FirstName]).or(TP::ApiKeys) => "Or<CanDecrypt<[Ssn9, FirstName]>,ApiKeys>")]
    #[test_case(Any.or_admin() => "Or<Any,Admin>")]
    fn test_display<T: IsPermissionMet>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        format!("{}", t)
    }
}
