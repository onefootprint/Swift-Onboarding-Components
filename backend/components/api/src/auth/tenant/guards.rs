use super::{CanCheckTenantGuard, IsGuardMet, TenantAuth};
use crate::auth::Either;
use either::Either::{Left, Right};
use itertools::Itertools;
use newtypes::{DataIdentifier, TenantScope};
use std::collections::HashSet;
use std::fmt;
use strum::Display;

/// Represents a simple permission that is required to execute an HTTP handler.
/// We don't use TenantScope to represent permissions required by an HTTP handler because some
/// scopes give access to more than one permission, like Decrypt.
#[derive(Display)]
pub enum TenantGuard {
    Admin,
    Read,
    OnboardingConfiguration,
    ApiKeys,
    OrgSettings,
    ManualReview,
}

impl TenantGuard {
    /// Maps a TenantPermission to the TenantScope that grants this permission
    fn granting_scope(&self) -> TenantScope {
        match self {
            Self::Admin => TenantScope::Admin,
            Self::Read => TenantScope::Read,
            Self::OnboardingConfiguration => TenantScope::OnboardingConfiguration,
            Self::ApiKeys => TenantScope::ApiKeys,
            Self::OrgSettings => TenantScope::OrgSettings,
            Self::ManualReview => TenantScope::ManualReview,
        }
    }
}

impl IsGuardMet for TenantGuard {
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        token_scopes.contains(&self.granting_scope())
    }
}

/// Represents a permission that is met if either its Left or Right permission is met
pub struct Or<Left, Right>(pub(crate) Left, pub(crate) Right);

impl<Left, Right> fmt::Display for Or<Left, Right>
where
    Left: IsGuardMet,
    Right: IsGuardMet,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Or<{},{}>", self.0, self.1)
    }
}

impl<Left, Right> IsGuardMet for Or<Left, Right>
where
    Left: IsGuardMet,
    Right: IsGuardMet,
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

impl IsGuardMet for Any {
    fn is_met(self, _token_scopes: &[TenantScope]) -> bool {
        true
    }
}

/// Represents a permission that is only met when the tenant auth token contains a scope that allows
/// decrypting the provided attributes
pub struct CanDecrypt(Vec<DataIdentifier>);

impl CanDecrypt {
    pub fn new<T>(l: Vec<T>) -> Self
    where
        DataIdentifier: From<T>,
    {
        Self(l.into_iter().map(DataIdentifier::from).collect())
    }

    #[allow(unused)]
    pub fn single<T: Into<DataIdentifier>>(k: T) -> Self {
        Self(vec![k.into()])
    }
}

impl fmt::Display for CanDecrypt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "CanDecrypt<{:?}>", self.0)
    }
}

impl IsGuardMet for CanDecrypt {
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        let (identity, other): (Vec<_>, Vec<_>) = self.0.into_iter().partition_map(|di| match di {
            // Identity data permissions are handled differently
            DataIdentifier::Id(idk) => Left(idk),
            // While Custom + Document permissions are very easy to determine
            DataIdentifier::Custom(_) => Right(token_scopes.contains(&TenantScope::DecryptCustom)),
            DataIdentifier::IdDocument => Right(token_scopes.contains(&TenantScope::DecryptDocuments)),
            DataIdentifier::Selfie => Right(token_scopes.contains(&TenantScope::DecryptSelfie)),
        });
        // Check if we can decrypt all the requested IdentityDataKind attributes - the logic
        // here is a little different
        let accessible_idks: HashSet<_> = token_scopes
            .iter()
            .filter_map(|p| match p {
                TenantScope::Decrypt(cdos) => Some(cdos),
                _ => None,
            })
            .flatten()
            .flat_map(|cdo| cdo.attributes())
            .collect();
        let can_access_idks = accessible_idks.is_superset(&HashSet::from_iter(identity.into_iter()));
        // Next, check if we can decrypt custom + id documents
        let can_access_other = other.into_iter().all(|v| v);
        can_access_idks && can_access_other
    }
}

impl<A, B> CanCheckTenantGuard for Either<A, B>
where
    A: CanCheckTenantGuard,
    B: CanCheckTenantGuard,
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

#[cfg(test)]
mod test {
    use super::{Any, CanDecrypt, TenantGuard as TG};
    use crate::auth::tenant::{IsGuardMet, TenantGuardDsl};
    use newtypes::{
        CollectedDataOption as CDO, DataIdentifier as DI, IdentityDataKind as IDK, KvDataKey,
        TenantScope as TS,
    };
    use std::str::FromStr;
    use test_case::test_case;

    //
    // Basic TenantPermission enum
    //
    #[test_case(&[TS::OnboardingConfiguration], TG::ApiKeys => false)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TG::ApiKeys => true)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TG::OnboardingConfiguration => true)]
    #[test_case(&[TS::ApiKeys, TS::OnboardingConfiguration], TG::ManualReview => false)]
    #[test_case(&[], TG::OnboardingConfiguration => false)]
    //
    // Test CanDecrypt
    //
    // Identity data
    #[test_case(&[TS::ApiKeys], CanDecrypt::new(vec![IDK::Ssn9]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name]), TS::Decrypt(vec![CDO::FullAddress]), TS::ApiKeys], CanDecrypt::new(vec![IDK::FirstName, IDK::City]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![IDK::Ssn9]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![IDK::Ssn4]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![IDK::Ssn4, IDK::FirstName]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name])], CanDecrypt::new(vec![IDK::Ssn4]) => false)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name, CDO::FullAddress])], CanDecrypt::new(vec![IDK::FirstName, IDK::Zip]) => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Name, CDO::FullAddress])], CanDecrypt::new(vec![IDK::FirstName, IDK::Email]) => false)]
    #[test_case(&[TS::Decrypt(vec![])], CanDecrypt::new(vec![IDK::FirstName]) => false)]
    // CanDecrypt custom + identity docs
    #[test_case(&[TS::Decrypt(vec![CDO::Name])], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::DecryptDocuments], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => true)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![DI::IdDocument]) => false)]
    #[test_case(&[TS::DecryptDocuments], CanDecrypt::new(vec![DI::IdDocument]) => true)]
    // CanDecrypt complex
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::IdDocument]) => false)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocuments, TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocuments, TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::IdDocument]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocuments, TS::Decrypt(vec![CDO::Ssn9])], CanDecrypt::new(vec![DI::Id(IDK::FirstName), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::IdDocument]) => false)]
    //
    // Test Or
    //
    #[test_case(&[TS::OnboardingConfiguration], TG::OnboardingConfiguration.or(TG::Admin) => true)]
    #[test_case(&[TS::OnboardingConfiguration], TG::Admin.or(TG::OnboardingConfiguration) => true)]
    #[test_case(&[TS::Admin], TG::OnboardingConfiguration.or_admin() => true)]
    #[test_case(&[TS::Admin], CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName, IDK::Email]).or_admin() => true)]
    #[test_case(&[TS::Read], CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName, IDK::Email]).or_admin() => false)]
    #[test_case(&[TS::Read], TG::ApiKeys.or(TG::Read) => true)]
    #[test_case(&[TS::OnboardingConfiguration], TG::ApiKeys.or_admin() => false)]
    #[test_case(&[TS::OnboardingConfiguration], TG::ApiKeys.or(TG::ApiKeys).or(TG::OrgSettings) => false)]
    #[test_case(&[TS::ApiKeys], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    #[test_case(&[TS::ManualReview], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    #[test_case(&[TS::OrgSettings], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    //
    // Test Any
    //
    #[test_case(&[TS::ApiKeys], Any => true)]
    #[test_case(&[], Any => true)]
    #[test_case(&[TS::Decrypt(vec![CDO::Ssn9])], Any => true)]
    /// Test that the token_scopes associated with an authentication method gives access to perform
    /// the requested_permission
    fn test_is_permission_met<T: IsGuardMet>(token_scopes: &[TS], requested_permission: T) -> bool {
        requested_permission.is_met(token_scopes)
    }

    #[test_case(TG::ApiKeys.or_admin() => "Or<ApiKeys,Admin>")]
    #[test_case(CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName]).or(TG::ApiKeys) => "Or<CanDecrypt<[Id(Ssn9), Id(FirstName)]>,ApiKeys>")]
    #[test_case(Any.or_admin() => "Or<Any,Admin>")]
    fn test_display<T: IsGuardMet>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        format!("{}", t)
    }
}
