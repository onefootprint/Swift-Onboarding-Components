use super::CanCheckTenantGuard;
use super::IsGuardMet;
use crate::auth::CanDecrypt;
use crate::auth::DisplayGuardError;
use crate::auth::Either;
use crate::auth::ImplDisplayGuardError;
use itertools::Itertools;
use newtypes::CollectedDataOption as CDO;
use newtypes::DataIdentifier;
use newtypes::DocumentDiKind;
use newtypes::DocumentSide;
use newtypes::InvokeVaultProxyPermission;
use newtypes::TenantScope;
use strum::Display;

/// Represents a simple permission that is required to execute an HTTP handler.
#[derive(Display)]
pub enum TenantGuard {
    Admin,
    Read,
    WriteEntities,
    OnboardingConfiguration,
    WriteLists,
    ApiKeys,
    OrgSettings,
    ManageVaultProxy,
    ManualReview,
    CipIntegration,
    TriggerKyb,
    TriggerKyc,
    AuthToken,
    ManageWebhooks,
    Onboarding,
    LabelAndTag,
    ManageComplianceDocSubmission,
}

impl TenantGuard {
    /// Maps a TenantPermission to the TenantScope that grants this permission
    fn granting_scope(&self) -> TenantScope {
        match self {
            Self::Admin => TenantScope::Admin,
            Self::Read => TenantScope::Read,
            Self::WriteEntities => TenantScope::WriteEntities,
            Self::OnboardingConfiguration => TenantScope::OnboardingConfiguration,
            Self::WriteLists => TenantScope::WriteLists,
            Self::ApiKeys => TenantScope::ApiKeys,
            Self::OrgSettings => TenantScope::OrgSettings,
            Self::ManageVaultProxy => TenantScope::ManageVaultProxy,
            Self::ManualReview => TenantScope::ManualReview,
            Self::CipIntegration => TenantScope::CipIntegration,
            Self::TriggerKyb => TenantScope::TriggerKyb,
            Self::TriggerKyc => TenantScope::TriggerKyc,
            Self::AuthToken => TenantScope::AuthToken,
            Self::ManageWebhooks => TenantScope::ManageWebhooks,
            Self::Onboarding => TenantScope::Onboarding,
            Self::LabelAndTag => TenantScope::LabelAndTag,
            Self::ManageComplianceDocSubmission => TenantScope::ManageComplianceDocSubmission,
        }
    }
}

impl IsGuardMet<TenantScope> for TenantGuard {
    fn is_met(&self, token_scopes: &[TenantScope]) -> bool {
        token_scopes.contains(&self.granting_scope()) || token_scopes.contains(&TenantScope::Admin)
    }
}

impl ImplDisplayGuardError for TenantGuard {}

/// Represents a complaince partner permission that is required to execute an HTTP handler.
#[derive(Display)]
pub enum PartnerTenantGuard {
    Admin,
    Read,
    ManageTemplates,
    ManageReviews,
}

impl PartnerTenantGuard {
    /// Maps a TenantPermission to the TenantScope that grants this permission
    fn granting_scope(&self) -> TenantScope {
        match self {
            Self::Admin => TenantScope::CompliancePartnerAdmin,
            Self::Read => TenantScope::CompliancePartnerRead,
            Self::ManageTemplates => TenantScope::CompliancePartnerManageTemplates,
            Self::ManageReviews => TenantScope::CompliancePartnerManageReviews,
        }
    }
}

impl IsGuardMet<TenantScope> for PartnerTenantGuard {
    fn is_met(&self, token_scopes: &[TenantScope]) -> bool {
        token_scopes.contains(&self.granting_scope())
            || token_scopes.contains(&TenantScope::CompliancePartnerAdmin)
    }
}

impl ImplDisplayGuardError for PartnerTenantGuard {}

impl IsGuardMet<TenantScope> for InvokeVaultProxyPermission {
    fn is_met(&self, token_scopes: &[TenantScope]) -> bool {
        if token_scopes.contains(&TenantScope::Admin) {
            return true;
        }

        let allowed_vault_proxy_permissions = token_scopes
            .iter()
            .filter_map(|ts| match ts {
                TenantScope::InvokeVaultProxy { data } => Some(data),
                _ => None,
            })
            .collect_vec();
        allowed_vault_proxy_permissions.contains(&&InvokeVaultProxyPermission::Any)
            || allowed_vault_proxy_permissions.contains(&self)
    }
}

impl ImplDisplayGuardError for InvokeVaultProxyPermission {}

fn can_decrypt(di: &DataIdentifier, token_scopes: &[TenantScope]) -> bool {
    match di {
        // Id and Business data permissions are handled with CDOs
        DataIdentifier::Id(_) | DataIdentifier::Business(_) | DataIdentifier::InvestorProfile(_) => {
            token_scopes
                .iter()
                .filter_map(|p| match p {
                    TenantScope::Decrypt { data: cdo } => Some(cdo),
                    _ => None,
                })
                .flat_map(|cdo| cdo.data_identifiers())
                .flatten()
                .contains(di)
        }
        // While Custom + Document permissions are very easy to determine
        DataIdentifier::Custom(_) => token_scopes.contains(&TenantScope::DecryptCustom),
        // TODO can we simplify document permissions?
        DataIdentifier::Document(DocumentDiKind::SsnCard)
        | DataIdentifier::Document(DocumentDiKind::ProofOfAddress)
        | DataIdentifier::Document(DocumentDiKind::Image(_, DocumentSide::Front))
        | DataIdentifier::Document(DocumentDiKind::Image(_, DocumentSide::Back))
        | DataIdentifier::Document(DocumentDiKind::LatestUpload(_, DocumentSide::Front))
        | DataIdentifier::Document(DocumentDiKind::LatestUpload(_, DocumentSide::Back))
        | DataIdentifier::Document(DocumentDiKind::OcrData(_, _))
        | DataIdentifier::Document(DocumentDiKind::MimeType(_, _))
        | DataIdentifier::Document(DocumentDiKind::Barcodes(_, _))
        | DataIdentifier::Document(DocumentDiKind::Custom(_)) => {
            token_scopes.contains(&TenantScope::DecryptDocument)
                || token_scopes.contains(&TenantScope::DecryptDocumentAndSelfie)
        }
        DataIdentifier::Document(DocumentDiKind::Image(_, DocumentSide::Selfie))
        | DataIdentifier::Document(DocumentDiKind::LatestUpload(_, DocumentSide::Selfie)) => {
            token_scopes.contains(&TenantScope::DecryptDocumentAndSelfie)
        }
        DataIdentifier::Document(newtypes::DocumentDiKind::FinraComplianceLetter) => {
            token_scopes.contains(&TenantScope::Decrypt {
                data: CDO::InvestorProfile,
            })
        }
        DataIdentifier::Card(_) => token_scopes.contains(&TenantScope::Decrypt { data: CDO::Card }),
    }
}

impl IsGuardMet<TenantScope> for CanDecrypt {
    fn is_met(&self, token_scopes: &[TenantScope]) -> bool {
        if token_scopes.contains(&TenantScope::Admin) || token_scopes.contains(&TenantScope::DecryptAll) {
            return true;
        }
        // Otherwise, check fine-grained decryption permissions.
        self.0.iter().all(|di| can_decrypt(di, token_scopes))
    }
}

impl DisplayGuardError<TenantScope> for CanDecrypt {
    fn error_display(&self, token_scopes: &[TenantScope]) -> String {
        let cannot_decrypt_dis = self
            .0
            .iter()
            .filter(|di| !can_decrypt(di, token_scopes))
            .cloned()
            .collect();
        CanDecrypt(cannot_decrypt_dis).to_string()
    }
}

impl<A, B, T> CanCheckTenantGuard for Either<A, B>
where
    A: CanCheckTenantGuard<Auth = T>,
    B: CanCheckTenantGuard<Auth = T>,
{
    type Auth = T;

    fn raw_token_scopes(&self) -> Vec<TenantScope> {
        match self {
            Either::Left(l) => l.raw_token_scopes(),
            Either::Right(r) => r.raw_token_scopes(),
        }
    }

    fn auth(self) -> T {
        match self {
            Either::Left(l) => l.auth(),
            Either::Right(r) => r.auth(),
        }
    }

    fn purpose(&self) -> Option<newtypes::TenantSessionPurpose> {
        match self {
            Either::Left(l) => l.purpose(),
            Either::Right(r) => r.purpose(),
        }
    }
}

#[cfg(test)]
mod test {
    use super::CanDecrypt;
    use super::PartnerTenantGuard as PTG;
    use super::TenantGuard as TG;
    use crate::auth::tenant::IsGuardMet;
    use crate::auth::Any;
    use newtypes::BusinessDataKind as BDK;
    use newtypes::CollectedDataOption as CDO;
    use newtypes::DataIdentifier as DI;
    use newtypes::DocumentDiKind;
    use newtypes::DocumentSide;
    use newtypes::IdDocKind;
    use newtypes::IdentityDataKind as IDK;
    use newtypes::KvDataKey;
    use newtypes::TenantScope as TS;
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
    #[test_case(&[TS::Decrypt{data: CDO::Name}, TS::Decrypt{data: CDO::FullAddress}, TS::ApiKeys], CanDecrypt::new(vec![IDK::FirstName, IDK::City]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![IDK::Ssn9]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![IDK::Ssn4]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![IDK::Ssn4, IDK::FirstName]) => false)]
    #[test_case(&[TS::Decrypt{data: CDO::Name}], CanDecrypt::new(vec![IDK::Ssn4]) => false)]
    #[test_case(&[TS::Decrypt{data: CDO::Name}, TS::Decrypt{data: CDO::FullAddress}], CanDecrypt::new(vec![IDK::FirstName, IDK::Zip]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::Name}, TS::Decrypt{data: CDO::FullAddress}], CanDecrypt::new(vec![IDK::FirstName, IDK::Email]) => false)]
    #[test_case(&[TS::Decrypt{data: CDO::BusinessName}], CanDecrypt::new(vec![BDK::Name]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::BusinessAddress}], CanDecrypt::new(vec![BDK::AddressLine1, BDK::AddressLine2, BDK::City, BDK::State, BDK::Zip, BDK::Country]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::BusinessWebsite}], CanDecrypt::new(vec![BDK::Website]) => true)]
    #[test_case(&[TS::Decrypt{data: CDO::BusinessWebsite}], CanDecrypt::new(vec![BDK::Website, BDK::Name]) => false)]
    #[test_case(&[], CanDecrypt::new(vec![IDK::FirstName]) => false)]
    #[test_case(&[], CanDecrypt::new(vec![BDK::Name]) => false)]
    // CanDecrypt custom
    #[test_case(&[TS::Decrypt{data: CDO::Name}], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => true)]
    #[test_case(&[TS::DecryptCustom], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => false)]
    #[test_case(&[TS::Decrypt{data: CDO::Name}], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::IdCard, DocumentSide::Selfie))]) => false)]
    // CanDecrypt identity docs
    #[test_case(&[TS::DecryptDocumentAndSelfie], CanDecrypt::new(vec![KvDataKey::from_str("custom.key").unwrap()]) => false)]
    #[test_case(&[TS::DecryptDocumentAndSelfie], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => true)]
    #[test_case(&[TS::DecryptDocumentAndSelfie], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::IdCard, DocumentSide::Selfie))]) => true)]
    #[test_case(&[TS::DecryptDocument], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => true)]
    #[test_case(&[TS::DecryptDocument], CanDecrypt::new(vec![DI::Document(DocumentDiKind::Image(IdDocKind::IdCard, DocumentSide::Selfie))]) => false)]
    // CanDecrypt complex
    #[test_case(&[TS::DecryptCustom, TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => false)]
    #[test_case(&[TS::DecryptCustom, TS::Decrypt{data: CDO::Ssn9}, TS::Decrypt{data: CDO::BusinessName}], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Business(BDK::Name), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocumentAndSelfie, TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap())]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocumentAndSelfie, TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![DI::Id(IDK::Ssn4), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => true)]
    #[test_case(&[TS::DecryptCustom, TS::DecryptDocumentAndSelfie, TS::Decrypt{data: CDO::Ssn9}], CanDecrypt::new(vec![DI::Id(IDK::FirstName), DI::Custom(KvDataKey::from_str("custom.key").unwrap()), DI::Document(DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front))]) => false)]
    //
    // Test Admin
    //
    // 1. Having admin scope passes admin guards.
    #[test_case(&[TS::WriteEntities, TS::Admin], TG::Admin => true)]
    #[test_case(&[TS::CompliancePartnerAdmin, TS::CompliancePartnerRead], PTG::Admin => true)]
    // 2. Having admin scope passes sub-admin guards.
    #[test_case(&[TS::Admin], TG::OnboardingConfiguration=> true)]
    #[test_case(&[TS::CompliancePartnerAdmin], PTG::Read => true)]
    // 3. Not having admin scope fails admin guards.
    #[test_case(&[TS::OnboardingConfiguration], TG::Admin => false)]
    #[test_case(&[TS::CompliancePartnerRead], PTG::Admin => false)]
    // 4. Having admin scope doesn't allow passing admin guard for a different tenant type.
    #[test_case(&[TS::WriteEntities, TS::Admin], PTG::Admin => false)]
    #[test_case(&[TS::CompliancePartnerAdmin, TS::CompliancePartnerRead], TG::Admin => false)]
    //
    // Test Or
    #[test_case(&[TS::OnboardingConfiguration], TG::OnboardingConfiguration.or(TG::Admin) => true)]
    #[test_case(&[TS::OnboardingConfiguration], TG::Admin.or(TG::OnboardingConfiguration) => true)]
    #[test_case(&[TS::Admin], TG::OnboardingConfiguration.or(TG::Admin) => true)]
    #[test_case(&[TS::Admin], CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName, IDK::Email]).or(TG::Admin) => true)]
    #[test_case(&[TS::Read], CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName, IDK::Email]).or(TG::Admin) => false)]
    #[test_case(&[TS::Read], TG::ApiKeys.or(TG::Read) => true)]
    #[test_case(&[TS::OnboardingConfiguration], TG::ApiKeys.or(TG::Admin) => false)]
    #[test_case(&[TS::OnboardingConfiguration], TG::ApiKeys.or(TG::ApiKeys).or(TG::OrgSettings) => false)]
    #[test_case(&[TS::ApiKeys], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    #[test_case(&[TS::ManualReview], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    #[test_case(&[TS::OrgSettings], TG::ApiKeys.or(TG::ManualReview).or(TG::OrgSettings) => true)]
    //
    // Test Any
    #[test_case(&[TS::ApiKeys], Any => true)]
    #[test_case(&[], Any => true)]
    #[test_case(&[TS::Decrypt{data: CDO::Ssn9}], Any => true)]
    /// Test that the token_scopes associated with an authentication method gives access to perform
    /// the requested_permission
    fn test_is_permission_met<T: IsGuardMet<TS>>(token_scopes: &[TS], requested_permission: T) -> bool {
        requested_permission.is_met(token_scopes)
    }

    #[test_case(TG::ApiKeys.or(TG::Admin) => "Or<ApiKeys,Admin>")]
    #[test_case(CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName]).or(TG::ApiKeys) => "Or<CanDecrypt<id.ssn9, id.first_name>,ApiKeys>")]
    #[test_case(Any.or(TG::Admin) => "Or<Any,Admin>")]
    fn test_display<T: IsGuardMet<TS>>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        t.error_display(&[])
    }

    #[test_case(CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName]).or(TG::ApiKeys) => "Or<CanDecrypt<id.ssn9>,ApiKeys>")]
    #[test_case(TG::ApiKeys.and(CanDecrypt::new(vec![IDK::Ssn9, IDK::FirstName])) => "And<ApiKeys,CanDecrypt<id.ssn9>>")]
    fn test_decrypt_display<T: IsGuardMet<TS>>(t: T) -> String {
        // Display is used to show an informative error message when permissions aren't met
        t.error_display(&[TS::Decrypt { data: CDO::Name }])
    }
}
