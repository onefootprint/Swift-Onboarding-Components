use super::{CanCheckTenantGuard, IsGuardMet, TenantAuth};
use crate::auth::{CanDecrypt, Either};
use db::models::tenant_role::TenantRole;
use either::Either::{Left, Right};
use itertools::Itertools;
use newtypes::{CollectedDataOption as CDO, DataIdentifier, DocumentKind, TenantScope};
use std::collections::HashSet;
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
    VaultProxy,
    CipIntegration,
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
            Self::VaultProxy => TenantScope::VaultProxy,
            Self::CipIntegration => TenantScope::CipIntegration,
        }
    }
}

impl IsGuardMet<TenantScope> for TenantGuard {
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        token_scopes.contains(&self.granting_scope())
    }
}

impl IsGuardMet<TenantScope> for CanDecrypt {
    fn is_met(self, token_scopes: &[TenantScope]) -> bool {
        if token_scopes.contains(&TenantScope::DecryptAll) {
            return true;
        }

        // Otherwise, check fine-grained decryption permissions.
        // We have these two codepaths below separated with partition_map to support some CDOs that
        // are difficult to map directly to DIs for now. For the CDOs that do map cleanly to DIs,
        // the check is very simple
        let (identifiers, other): (Vec<_>, Vec<_>) = self.0.into_iter().partition_map(|di| match di {
            // Id and Business data permissions are handled with CDOs
            DataIdentifier::Id(_) | DataIdentifier::Business(_) | DataIdentifier::InvestorProfile(_) => {
                Left(di)
            }
            // While Custom + Document permissions are very easy to determine
            DataIdentifier::Custom(_) => Right(token_scopes.contains(&TenantScope::DecryptCustom)),
            DataIdentifier::Document(DocumentKind::Passport)
            | DataIdentifier::Document(DocumentKind::PassportNumber)
            | DataIdentifier::Document(DocumentKind::PassportExpiration)
            | DataIdentifier::Document(DocumentKind::PassportDob)
            | DataIdentifier::Document(DocumentKind::DriversLicenseFront)
            | DataIdentifier::Document(DocumentKind::DriversLicenseBack)
            | DataIdentifier::Document(DocumentKind::DriversLicenseNumber)
            | DataIdentifier::Document(DocumentKind::DriversLicenseExpiration)
            | DataIdentifier::Document(DocumentKind::DriversLicenseDob)
            | DataIdentifier::Document(DocumentKind::DriversLicenseIssuingState)
            | DataIdentifier::Document(DocumentKind::IdCardFront)
            | DataIdentifier::Document(DocumentKind::IdCardBack)
            | DataIdentifier::Document(DocumentKind::IdCardNumber)
            | DataIdentifier::Document(DocumentKind::IdCardExpiration)
            | DataIdentifier::Document(DocumentKind::MimeType(_, _))
            | DataIdentifier::Document(DocumentKind::LatestUpload(_, _)) => {
                let can_decrypt = token_scopes.contains(&TenantScope::Decrypt(CDO::Document))
                    || token_scopes.contains(&TenantScope::Decrypt(CDO::DocumentAndSelfie));
                Right(can_decrypt)
            }
            DataIdentifier::Document(newtypes::DocumentKind::FinraComplianceLetter) => {
                Right(token_scopes.contains(&TenantScope::Decrypt(CDO::InvestorProfile)))
            }
            DataIdentifier::Document(newtypes::DocumentKind::IdCardSelfie)
            | DataIdentifier::Document(newtypes::DocumentKind::PassportSelfie)
            | DataIdentifier::Document(newtypes::DocumentKind::DriversLicenseSelfie) => {
                Right(token_scopes.contains(&TenantScope::Decrypt(CDO::DocumentAndSelfie)))
            }
            DataIdentifier::Card(_) => Right(token_scopes.contains(&TenantScope::Decrypt(CDO::Card))),
        });
        // Check if we can decrypt all the requested IdentityDataKind attributes - the logic
        // here is a little different
        let accessible_data: HashSet<_> = token_scopes
            .iter()
            .filter_map(|p| match p {
                TenantScope::Decrypt(cdo) => Some(cdo),
                _ => None,
            })
            .flat_map(|cdo| cdo.data_identifiers())
            .flatten()
            .collect();
        let can_access = accessible_data.is_superset(&HashSet::from_iter(identifiers.into_iter()));
        // Next, check if we can decrypt custom + id documents
        let can_access_other = other.into_iter().all(|v| v);
        can_access && can_access_other
    }
}

impl<A, B> CanCheckTenantGuard for Either<A, B>
where
    A: CanCheckTenantGuard,
    B: CanCheckTenantGuard,
{
    fn role(&self) -> &TenantRole {
        match self {
            Either::Left(l) => l.role(),
            Either::Right(r) => r.role(),
        }
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
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
    use super::{CanDecrypt, TenantGuard as TG};
    use crate::auth::tenant::{IsGuardMet, TenantGuardDsl};
    use crate::auth::Any;
    use newtypes::{
        BusinessDataKind as BDK, CollectedDataOption as CDO, DataIdentifier as DI, DocumentKind,
        IdentityDataKind as IDK, KvDataKey, TenantScope as TS,
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
    // Identity + business data
    #[test_case(&[TS::ApiKeys], CanDecrypt::new(vec![IDK::Ssn9]) => false)]
    #[test_case(&[TS::Decrypt(CDO::Name), TS::Decrypt(CDO::FullAddress), TS::ApiKeys], CanDecrypt::new(vec![IDK::FirstName, IDK::City]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![IDK::Ssn9]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![IDK::Ssn4]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![IDK::Ssn4, IDK::FirstName]) => false)]
    #[test_case(&[TS::Decrypt(CDO::Name)], CanDecrypt::new(vec![IDK::Ssn4]) => false)]
    #[test_case(&[TS::Decrypt(CDO::Name), TS::Decrypt(CDO::FullAddress)], CanDecrypt::new(vec![IDK::FirstName, IDK::Zip]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Name), TS::Decrypt(CDO::FullAddress)], CanDecrypt::new(vec![IDK::FirstName, IDK::Email]) => false)]
    #[test_case(&[TS::Decrypt(CDO::BusinessName)], CanDecrypt::new(vec![BDK::Name]) => true)]
    #[test_case(&[TS::Decrypt(CDO::BusinessAddress)], CanDecrypt::new(vec![BDK::AddressLine1, BDK::AddressLine2, BDK::City, BDK::State, BDK::Zip, BDK::Country]) => true)]
    #[test_case(&[TS::Decrypt(CDO::BusinessWebsite)], CanDecrypt::new(vec![BDK::Website]) => true)]
    #[test_case(&[TS::Decrypt(CDO::BusinessWebsite)], CanDecrypt::new(vec![BDK::Website, BDK::Name]) => false)]
    #[test_case(&[], CanDecrypt::new(vec![IDK::FirstName]) => false)]
    #[test_case(&[], CanDecrypt::new(vec![BDK::Name]) => false)]
    // CanDecrypt custom
    #[test_case(&[TS::Decrypt(CDO::Name)], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => true)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![DI::Document(DocumentKind::Passport)]) => false)]
    #[test_case(&[TS::Decrypt(CDO::Name)], CanDecrypt::new(vec![DI::Document(DocumentKind::IdCardSelfie)]) => false)]
    // CanDecrypt identity docs
    #[test_case(&[TS::Decrypt(CDO::DocumentAndSelfie)], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::Decrypt(CDO::DocumentAndSelfie)], CanDecrypt::new(vec![DI::Document(DocumentKind::Passport)]) => true)]
    #[test_case(&[TS::Decrypt(CDO::DocumentAndSelfie)], CanDecrypt::new(vec![DI::Document(DocumentKind::IdCardSelfie)]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Document)], CanDecrypt::new(vec![DI::Document(DocumentKind::Passport)]) => true)]
    #[test_case(&[TS::Decrypt(CDO::Document)], CanDecrypt::new(vec![DI::Document(DocumentKind::IdCardSelfie)]) => false)]
    // CanDecrypt complex
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Document(DocumentKind::Passport)]) => false)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(CDO::Ssn9), TS::Decrypt(CDO::BusinessName)], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Business(BDK::Name), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(CDO::DocumentAndSelfie), TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(CDO::DocumentAndSelfie), TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::Document(DocumentKind::Passport)]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt(CDO::DocumentAndSelfie), TS::Decrypt(CDO::Ssn9)], CanDecrypt::new(vec![DI::Id(IDK::FirstName), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::Document(DocumentKind::Passport)]) => false)]
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
    #[test_case(&[TS::Decrypt(CDO::Ssn9)], Any => true)]
    /// Test that the token_scopes associated with an authentication method gives access to perform
    /// the requested_permission
    fn test_is_permission_met<T: IsGuardMet<TS>>(token_scopes: &[TS], requested_permission: T) -> bool {
        requested_permission.is_met(token_scopes)
    }

    #[test_case(TG::ApiKeys.or_admin() => "Or<ApiKeys,Admin>")]
    #[test_case(CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName]).or(TG::ApiKeys) => "Or<CanDecrypt<id.ssn9, id.first_name>,ApiKeys>")]
    #[test_case(Any.or_admin() => "Or<Any,Admin>")]
    fn test_display<T: IsGuardMet<TS>>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        format!("{}", t)
    }
}
