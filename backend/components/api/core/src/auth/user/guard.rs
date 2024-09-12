use crate::auth::CanDecrypt;
use crate::auth::DisplayGuardError;
use crate::auth::ImplDisplayGuardError;
use crate::auth::IsGuardMet;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind as IDK;
use newtypes::UserAuthScope;

impl IsGuardMet<UserAuthScope> for UserAuthScope {
    fn is_met(&self, token_scopes: &[UserAuthScope]) -> bool {
        token_scopes.contains(self)
    }
}

impl ImplDisplayGuardError for UserAuthScope {}

fn can_decrypt(di: &DataIdentifier, token_scopes: &[UserAuthScope]) -> bool {
    match di {
        DataIdentifier::Id(id) => match id {
            IDK::PhoneNumber | IDK::Email | IDK::VerifiedPhoneNumber | IDK::VerifiedEmail => {
                UserAuthScope::BasicProfile
                    .or(UserAuthScope::SignUp)
                    .or(UserAuthScope::Auth)
                    .is_met(token_scopes)
            }
            IDK::AddressLine1
            | IDK::AddressLine2
            | IDK::Dob
            | IDK::City
            | IDK::State
            | IDK::Country
            | IDK::Zip
            | IDK::FirstName
            | IDK::MiddleName
            | IDK::LastName
            | IDK::UsLegalStatus
            | IDK::Citizenships
            | IDK::VisaKind
            | IDK::VisaExpirationDate
            | IDK::DriversLicenseState
            | IDK::Nationality => {
                // Either BasicProfile or SignUp give permissions to decrypt basic info
                UserAuthScope::BasicProfile
                    .or(UserAuthScope::SignUp)
                    .is_met(token_scopes)
            }
            IDK::UsTaxId | IDK::Itin | IDK::DriversLicenseNumber | IDK::Ssn4 | IDK::Ssn9 => {
                UserAuthScope::SensitiveProfile.is_met(token_scopes)
            }
        },
        DataIdentifier::Business(bdk) => match bdk {
            BDK::Name
            | BDK::Dba
            | BDK::Website
            | BDK::PhoneNumber
            | BDK::AddressLine1
            | BDK::AddressLine2
            | BDK::City
            | BDK::State
            | BDK::Zip
            | BDK::Country
            | BDK::BeneficialOwners
            | BDK::KycedBeneficialOwners
            | BDK::CorporationType
            | BDK::FormationDate
            | BDK::FormationState => {
                // Either BasicProfile or SignUp give permissions to decrypt basic info
                UserAuthScope::BasicProfile
                    .or(UserAuthScope::SignUp)
                    .is_met(token_scopes)
            }
            BDK::Tin => UserAuthScope::SensitiveProfile.is_met(token_scopes),
        },
        DataIdentifier::InvestorProfile(_) => true,
        // We don't allow decrypting business data with a user auth token right now - we
        // theoretically could, but we just don't support portable businesses yet
        _ => false,
    }
}

impl IsGuardMet<UserAuthScope> for CanDecrypt {
    fn is_met(&self, token_scopes: &[UserAuthScope]) -> bool {
        self.0.iter().all(|di| can_decrypt(di, token_scopes))
    }
}

impl DisplayGuardError<UserAuthScope> for CanDecrypt {
    fn error_display(&self, token_scopes: &[UserAuthScope]) -> String {
        let cannot_decrypt_dis = self
            .0
            .iter()
            .filter(|di| !can_decrypt(di, token_scopes))
            .cloned()
            .collect();
        CanDecrypt(cannot_decrypt_dis).to_string()
    }
}
